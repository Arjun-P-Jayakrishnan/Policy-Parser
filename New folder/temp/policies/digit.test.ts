import assert from "node:assert/strict";
import test from "node:test";
import { createPolicy } from "../../format/policy.js";
import type { PdfTextToken } from "../services/pdf_parser/types.js";
import { detectPolicyType } from "./detect.js";
import { parseDigitPolicy } from "./digit.js";

const token = (text: string, x = 1, y = 1): PdfTextToken => ({
  text,
  x,
  y,
  page: 1,
});

test("policy factory returns typed initialized fields", () => {
  const policy = createPolicy();
  assert.equal(policy.Status, false);
  assert.equal(policy.Date, "");
  assert.equal(policy.VehicleModel, "");
});

test("detects document markers", () => {
  assert.deepEqual(
    detectPolicyType([
      token("Schedule/CertificateGo Digit General Insurance Ltd."),
      token("HEUTE AND MORGEN INSURANCE"),
    ]),
    { isDigit: true, isHueteMorgan: true },
  );
});

test("parses current supported direct Go Digit fields", () => {
  const policy = parseDigitPolicy(
    [
      token("Policy Issue Date"),
      token("09-Sep-2026"),
      token("Fuel Type"),
      token("Petrol"),
      token("Make"),
      token("Acme"),
      token("HEUTE AND MORGEN INSURANCE"),
    ],
    "policy.pdf",
  );
  assert.equal(policy.Filename, "policy.pdf");
  assert.equal(policy.Date, "2026-09-09");
  assert.equal(policy.FuelType, "Petrol");
  assert.equal(policy.VehicleMake, "Acme");
  assert.equal(policy.Vertical, "HEUTE AND MORGEN INSURANCE");
});
