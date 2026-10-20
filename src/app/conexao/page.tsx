import { configuration } from "../../lib/supabase/server";
import { ConnectionPanel } from "../../features/connection/panel";
export const dynamic = "force-dynamic";
export default function Connection() {
  let config: { url: string; key: string } | null = null;
  try {
    config = configuration();
  } catch {
    /* The screen offers setup guidance without exposing configuration errors. */
  }
  return <ConnectionPanel config={config} />;
}
