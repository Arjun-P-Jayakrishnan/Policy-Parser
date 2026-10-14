import type { BlueprintRule } from "../../../../utils/blueprint-utils.js";

const field = (fieldName: string, pages: readonly number[], start: RegExp, end: RegExp, before?: RegExp): BlueprintRule => ({ field: fieldName, pages, start, end, before });

/** Variant 1 rules use the labels and boundaries printed in sample.pdf. */
export const VARIANT_1_BLUEPRINT: readonly BlueprintRule[] = [
  field("Name:", [1], /Name:/i, /Partner Name:/i),
  field("Partner Name:", [1], /Partner Name:/i, /Registration Number:/i),
  field("Registration Number:", [1], /Registration Number:/i, /Partner Code\s*:/i),
  field("Policy Number:", [1], /Policy Number:/i, /Policy Issue Date/i),
  field("Policy Issue Date", [1], /Policy Issue Date/i, /Invoice No\.?/i),
  field("Invoice No.", [1], /Invoice No\.?/i, /Invoice Date/i),
  field("Invoice Date", [1], /Invoice Date/i, /Period of Policy/i),
  field("Mobile Number:", [1], /(?<!Partner )Mobile Number:/i, /Partner Mobile Number:/i),
  field("Partner Mobile Number:", [1], /Partner Mobile Number:/i, /Address/i),
  field("Address", [1], /Address/i, /YOUR POLICY DETAILS/i),
  field("RTO Location", [2], /RTO Location/i, /Make/i),
  field("Make", [2], /Make/i, /Model\/Vehicle/i),
  field("Model/Vehicle Variant (Sub-Type)", [2], /Model\/Vehicle Variant\s*\(Sub-/i, /Engine No\./i),
  field("Engine No.", [2], /Engine No\./i, /Chassis No\./i),
  field("Chassis No.", [2], /Chassis No\./i, /Fuel Type/i),
  field("Fuel Type", [2], /Fuel Type/i, /Year of Regn\.?\/\s*Manufacturing/i),
  field("Year of Regn./ Manufacturing", [2], /Year of Regn\.?\/\s*Manufacturing/i, /Cubic Capacity/i),
  field("Cubic Capacity", [2], /Cubic Capacity/i, /Odometer/i),
  field("Odometer", [2], /Odometer/i, /YOUR VEHICLE IDV/i),
  field("NCB % (Current Policy)", [1], /NCB\s*%\s*\(Current Policy\)/i, /Own Damage Cover/i),
  field("Total OD Premium", [2], /Total OD Premium/i, /Total Act Premium/i),
  field("Total Act Premium", [2], /Total Act Premium/i, /Own Damage Premium/i),
  field("Net Premium", [2], /Net Premium/i, /Final Premium/i),
  field("Final Premium", [2], /Final Premium/i, /Note:/i),
  field("Previous Policy No.", [3], /Previous Policy No\.?/i, /Previous Policy Expiry Date/i),
  field("Previous Policy Expiry Date", [3], /Previous Policy Expiry Date/i, /Receipt Date/i),
  field("Payment Mode", [3], /Payment Mode/i, /Previous Insurer/i),
  field("Partner Code :", [1], /Partner Code\s*:/i, /Partner Mobile Number:/i),
];

