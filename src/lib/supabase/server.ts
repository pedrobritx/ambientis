import type { Database } from "./database.types";
import { createClient } from "@supabase/supabase-js";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function configuration() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new ApiError(503, "A conexão ainda não foi configurada.");
  const local =
    process.env.SUPABASE_LOCAL_MODE === "true" &&
    process.env.NODE_ENV !== "production" &&
    !process.env.VERCEL &&
    url === "http://127.0.0.1:54621";
  if (
    (!local && !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)) ||
    !key.startsWith("sb_publishable_")
  )
    throw new ApiError(503, "A configuração da conexão precisa ser conferida.");
  return { url, key };
}
export async function authenticatedClient(request: Request) {
  const bearer = request.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ") || bearer.length > 10000)
    throw new ApiError(401, "Entre na sua conta para continuar.");
  const token = bearer.slice(7);
  const { url, key } = configuration();
  const client = createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: init?.signal ?? AbortSignal.timeout(10000),
        }),
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous)
    throw new ApiError(401, "Sua sessão expirou. Entre novamente.");
  return client;
}
export function databaseError(error: { code?: string }) {
  if (error.code === "42501")
    throw new ApiError(403, "Sua conta não tem permissão para esta ação.");
  if (["23505", "40001"].includes(error.code ?? ""))
    throw new ApiError(
      409,
      "O registro já existe ou foi alterado. Atualize antes de tentar novamente.",
    );
  if (["23503", "23514", "22P02", "23502"].includes(error.code ?? ""))
    throw new ApiError(422, "Confira os campos e os vínculos informados.");
  throw new ApiError(
    503,
    "Não foi possível concluir a operação. Tente novamente.",
  );
}
export const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store", Vary: "Authorization" },
  });
export async function endpoint(work: () => Promise<Response>) {
  try {
    return await work();
  } catch (error) {
    if (error instanceof ApiError)
      return json({ error: error.message }, error.status);
    if (error instanceof SyntaxError)
      return json({ error: "Envie um objeto JSON válido." }, 400);
    return json({ error: "Não foi possível concluir a operação." }, 503);
  }
}
export async function body(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(415, "Envie os dados em JSON.");
  // Bound the stream as well as Content-Length; chunked bodies must obey the same limit.
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Informe os dados da operação.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32768) {
      await reader.cancel();
      throw new ApiError(413, "Os dados excedem o limite desta operação.");
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(buffer));
}
