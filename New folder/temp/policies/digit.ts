import type { PolicyData } from "../../format/policy.js";
import { createPolicy } from "../../format/policy.js";
import type { PdfTextToken } from "../services/pdf_parser/types.js";
import { detectPolicyType } from "./detect.js";

const cleanText = (token: PdfTextToken | undefined): string =>
  token?.text.trim() ?? "";
const labelMatches = (
  token: PdfTextToken | undefined,
  label: string,
): boolean => cleanText(token) === label;
const finiteCoordinate = (
  token: PdfTextToken | undefined,
  coordinate: "x" | "y",
): number | undefined =>
  token && Number.isFinite(token[coordinate]) ? token[coordinate] : undefined;

function parsePolicyDate(value: string): string {
  const parts = value.trim().split("-");
  if (parts.length !== 3) return "";
  const [dayText, monthText, yearText] = parts;
  const day = Number(dayText);
  const year = Number(yearText);
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const month =
    monthText.length === 3
      ? months.indexOf(monthText.toLowerCase()) + 1
      : Number(monthText);
  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    yearText.length !== 4 ||
    day < 1 ||
    month < 1 ||
    month > 12
  )
    return "";
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return "";
  return `${yearText}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Current Go Digit parser; field rules remain subject to review against extracted layouts. */
export function parseDigitPolicy(
  tokens: readonly PdfTextToken[] = [],
  fileName = "",
): PolicyData {
  const policy = createPolicy();
  policy.Filename = fileName;
  policy.InsuranceCompany = "Go Digit";
  let previousText = "";
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]!;
    const text = cleanText(token);
    const next = tokens[i + 1];
    if (previousText === "Policy Issue Date")
      policy.Date = parsePolicyDate(text);
    if (text === "Fuel Type" && next) policy.FuelType = cleanText(next);
    if (text === "Address" && !policy.Location && next)
      policy.Location = cleanText(next);
    if (text === "RTO Location" && next) policy.RTOCode = cleanText(next);
    if (text === "Make" && next) policy.VehicleMake = cleanText(next);
    if (text === "Cubic Capacity" && next)
      policy.CubicCapacity = cleanText(next);
    if (text === "Manufacturing" && next)
      policy.YearOfManufacture = cleanText(next);
    if (text === "Engine No." && next) policy.EngineNumber = cleanText(next);
    if (text === "Chassis No." && next) policy.ChassisNumber = cleanText(next);
    if (text === "NCB % (Current Policy)" && !policy.NCB && next)
      policy.NCB = cleanText(next);
    if (i + 5 < tokens.length && labelMatches(tokens[i + 5], "Partner Code :"))
      policy.IMDCode = text;
    if (i + 5 < tokens.length && labelMatches(tokens[i + 5], "Name:"))
      policy.CustomerName = text;
    if (i + 4 < tokens.length && labelMatches(tokens[i + 4], "Mobile Number:"))
      policy.MobileNumber = text;
    if (
      i + 5 < tokens.length &&
      labelMatches(tokens[i + 5], "Registration Number:")
    )
      policy.RegistrationNumber = text;
    if (
      i + 10 < tokens.length &&
      labelMatches(
        tokens[i + 10],
        "Previous Policy No.Previous Policy Expiry Date",
      )
    )
      policy.PrePolicyNo = text;
    if (
      i + 2 < tokens.length &&
      text === "Model/Vehicle Variant (Sub-" &&
      labelMatches(next, "Type)")
    )
      policy.VehicleModel = cleanText(tokens[i + 2]);
    if (text.startsWith("Policy No")) {
      const markerEnd = text.indexOf("Policy No") + "Policy No".length;
      let value = text.slice(markerEnd).trim();
      if (value.startsWith(":")) value = value.slice(1).trim();
      if (value && !value.includes(" ")) policy.PolicyNumber = value;
    }
    if (
      i + 20 < tokens.length &&
      labelMatches(tokens[i + 20], "Own Damage Premium")
    ) {
      const labelX = finiteCoordinate(tokens[i + 20], "x");
      const tokenX = finiteCoordinate(token, "x");
      if (labelX !== undefined && tokenX !== undefined && labelX - tokenX < 1)
        policy.ODPremium = text;
    }
    if (
      i + 9 < tokens.length &&
      labelMatches(tokens[i + 9], "Total OD Premium Total Act Premium")
    ) {
      const labelY = finiteCoordinate(tokens[i + 9], "y");
      const tokenY = finiteCoordinate(token, "y");
      if (labelY !== undefined && tokenY !== undefined && labelY - tokenY < 1)
        policy.TPOnlyPremium = text;
    }
    if (i + 5 < tokens.length && labelMatches(tokens[i + 5], "Net Premium")) {
      const labelY = finiteCoordinate(tokens[i + 5], "y");
      const tokenY = finiteCoordinate(token, "y");
      if (
        labelY !== undefined &&
        tokenY !== undefined &&
        Math.abs(tokenY - labelY) < 1
      )
        policy.NetPremium = text;
    }
    if (i + 9 < tokens.length && labelMatches(tokens[i + 9], "Final Premium")) {
      const labelY = finiteCoordinate(tokens[i + 9], "y");
      const tokenY = finiteCoordinate(token, "y");
      if (
        labelY !== undefined &&
        tokenY !== undefined &&
        Math.abs(tokenY - labelY) < 1
      )
        policy.TotalAmount = text;
    }
    if (i + 9 < tokens.length && labelMatches(tokens[i + 9], "Payment Mode")) {
      const labelY = finiteCoordinate(tokens[i + 9], "y");
      const tokenY = finiteCoordinate(token, "y");
      if (
        labelY !== undefined &&
        tokenY !== undefined &&
        Math.abs(tokenY - labelY) < 1
      )
        policy.ModeOfPayment = text;
    }
    previousText = text;
  }
  if (detectPolicyType(tokens).isHueteMorgan)
    policy.Vertical = "HEUTE AND MORGEN INSURANCE";
  return policy;
}
