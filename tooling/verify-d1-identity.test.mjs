import assert from "node:assert/strict";
import test from "node:test";
import { verifyD1Identity } from "./verify-d1-identity.mjs";

test("D1 identity verification requires both the expected name and UUID", () => {
  const payload = { name: "product-compare-phones-production", uuid: "11111111-1111-1111-1111-111111111111" };
  assert.equal(verifyD1Identity(payload, payload.name, payload.uuid), payload);
  assert.throws(
    () => verifyD1Identity(payload, "product-compare-tablets-production", payload.uuid),
    /identity mismatch/
  );
  assert.throws(
    () => verifyD1Identity(payload, payload.name, "22222222-2222-2222-2222-222222222222"),
    /identity mismatch/
  );
});

test("D1 identity verification accepts nested API result shapes", () => {
  const database = { database_name: "product-compare-cars-production", database_id: "33333333-3333-3333-3333-333333333333" };
  assert.equal(verifyD1Identity({ result: [database] }, database.database_name, database.database_id), database);
});
