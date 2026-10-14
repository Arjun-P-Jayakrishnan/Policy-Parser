import assert from "node:assert/strict";
import test from "node:test";
import type { LayoutLine } from "../../services/pdf-parser/types.js";
import { parseVariant1 } from "./variants/variant-1/parser.js";
import { normalizeGoDigitPolicy } from "./normalizer.js";

const line = (text: string, y = 1): LayoutLine => ({
  page: 1, y, text, tokens: [{ page: 1, x: 1, y, text }],
});

test("Variant 1 extracts sample-specific fields without output field names", () => {
  const lines = [
    line("Name: MAAN SINGH Partner Name: HEUTE AND MORGEN INSURANCE"),
    line("Policy Number: D272363175 / 10092026 Policy Issue Date 10-Sep-2026", 2),
    line("Registration Number: DL2CBB8461 RTO Location DL2C Make JEEP", 3),
    line("Model/Vehicle Variant (Sub-", 4),
    line("Type) COMPASS/1.4 SPORT MAIR", 5),
    line("Total OD Premium (`) 6054.25 Total Act Premium (`) 3796.00", 6),
  ];
  const parsed = parseVariant1(new Map([[1, lines.flatMap((item) => item.tokens)]]));
  assert.equal(parsed.variant, "variant-1");
  assert.equal(parsed.fields["Name:"], " MAAN SINGH ");
  assert.equal(parsed.fields["Partner Name:"], " HEUTE AND MORGEN INSURANCE Policy Number: D272363175 / 10092026 Policy Issue Date 10-Sep-2026");
  assert.equal(parsed.fields["Policy Number:"], " D272363175 / 10092026 ");
  assert.equal(parsed.fields["Total OD Premium"], undefined);
});

test("normalizer produces the existing output record and classifies OD premium", () => {
  const policy = normalizeGoDigitPolicy({
    registrationNumber: "DL2CBB8461", policyNumber: "D272363175 / 10092026",
    issueDate: "10-Sep-2026", totalOdPremium: "(`) 6054.25", totalActPremium: "(`) 3796.00",
    partnerName: "HEUTE AND MORGEN INSURANCE",
  }, "sample.pdf");
  assert.equal(policy.Filename, "sample.pdf");
  assert.equal(policy.PolicyNumber, "D272363175");
  assert.equal(policy.RTOCode, "DL2C");
  assert.equal(policy.Date, "2026-09-10");
  assert.equal(policy.ODPremium, "6054.25");
  assert.equal(policy.TPOnlyPremium, "3796.00");
  assert.equal(policy.Package, "Package");
  assert.equal(policy.Vertical, "HEUTE AND MORGEN INSURANCE");
});
