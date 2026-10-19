import { createPolicy, type PolicyData } from "../../../format/policy.js";
import type { Variant2Data } from "./types.js";

/** Creates the common policy row for the currently identified two-wheeler layout. */
export function normalize(data: Variant2Data): PolicyData {
  const policy = createPolicy();
  policy.InsuranceCompany = "Go Digit General Insurance";
  policy.Vertical = "Motor";
  policy.LOB = data.LOB;
  return policy;
}
