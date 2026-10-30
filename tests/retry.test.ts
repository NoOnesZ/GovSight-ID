import test from "node:test";
import assert from "node:assert/strict";
import { retry } from "../src/lib/retry";

test("pengambilan ulang berhasil setelah kegagalan sementara", async () => {
  let attempts = 0;
  const result = await retry(
    async () => {
      attempts++;
      if (attempts < 3) throw new Error("sementara");
      return "valid";
    },
    3,
    0,
  );
  assert.equal(result, "valid");
  assert.equal(attempts, 3);
});
test("pengambilan ulang berhenti jika gagal terus", async () => {
  let attempts = 0;
  await assert.rejects(
    retry(
      async () => {
        attempts++;
        throw new Error("konflik");
      },
      3,
      0,
    ),
    /konflik/,
  );
  assert.equal(attempts, 3);
});
