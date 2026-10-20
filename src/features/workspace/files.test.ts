import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { prepareDocument } from "./files";
import { MAX_FILE_BYTES } from "../../domain/workflow";

describe("synthetic evidence input", () => {
  it("preserves original bytes and calculates an independently verified hash", async () => {
    const bytes = Buffer.from("Evidência fictícia\n");
    const record = await prepareDocument(
      new File([bytes], "evidencia.txt"),
      "industry-job",
      "client-industry",
    );
    expect(Buffer.from(record.base64, "base64")).toEqual(bytes);
    expect(record.sha256).toBe(
      createHash("sha256").update(bytes).digest("hex"),
    );
  });
  it("rejects an extension/content mismatch, invalid UTF-8 and empty input", async () => {
    for (const file of [
      new File(["not a PDF"], "test.pdf"),
      new File([new Uint8Array([255, 0])], "test.txt"),
      new File([], "empty.txt"),
    ]) {
      await expect(
        prepareDocument(file, "industry-job", "client-industry"),
      ).rejects.toThrow();
    }
  });
  it("rejects a file above the local rehearsal limit", async () => {
    await expect(
      prepareDocument(
        new File([new Uint8Array(MAX_FILE_BYTES + 1)], "large.txt"),
        "industry-job",
        "client-industry",
      ),
    ).rejects.toThrow();
  });
});

it("accepts a real PNG signature without rewriting the evidence bytes", async () => {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jcK0AAAAASUVORK5CYII=",
    "base64",
  );
  const record = await prepareDocument(
    new File([png], "foto.png", { type: "image/png" }),
    "industry-job",
    "client-industry",
  );
  expect(record.mime).toBe("image/png");
  expect(Buffer.from(record.base64, "base64")).toEqual(png);
  expect(record.sha256).toBe(createHash("sha256").update(png).digest("hex"));
  await expect(
    prepareDocument(
      new File(["not a photo"], "photo.jpg", { type: "image/jpeg" }),
      "industry-job",
      "client-industry",
    ),
  ).rejects.toThrow();
});
