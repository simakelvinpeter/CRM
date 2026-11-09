import test from "node:test";
import assert from "node:assert/strict";
import { demoAccounts, DEMO_PASSWORD, signInDemo } from "../src/demoAuth.js";
test("every demo account gets only its assigned role", () => {
  for (const account of demoAccounts)
    assert.deepEqual(signInDemo(account.email, DEMO_PASSWORD), account);
});
test("email normalization accepts uppercase and spaces", () => {
  assert.equal(
    signInDemo(" OWNER@DEMO.AGENCY ", DEMO_PASSWORD).role,
    "Agency owner",
  );
});
test("invalid email and password cannot sign in", () => {
  assert.throws(() => signInDemo("owner@demo.agency", "wrong"), /incorrect/);
  assert.throws(
    () => signInDemo("unknown@demo.agency", DEMO_PASSWORD),
    /incorrect/,
  );
  assert.throws(() => signInDemo("", ""), /incorrect/);
});
test("returned demo accounts cannot mutate the public fixtures", () => {
  const account = signInDemo("referral@demo.agency", DEMO_PASSWORD);
  account.role = "Agency owner";
  assert.equal(
    signInDemo("referral@demo.agency", DEMO_PASSWORD).role,
    "Referral agent",
  );
});
