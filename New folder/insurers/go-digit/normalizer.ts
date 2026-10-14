import { createPolicy, type PolicyData } from "../../format/policy.js";
import type { Variant1Fields } from "./variants/variant-1/types.js";

/** Converts Variant 1's extracted source fields into the application's output record. */
export function normalizeGoDigitPolicy(
  rawFields: Variant1Fields | Record<string, string>,
  fileName = "",
): PolicyData {
  const source = rawFields as Record<string, string>;
  const fields: Variant1Fields = {
    customerName: source["Name:"] ?? source.customerName,
    partnerName: source["Partner Name:"] ?? source.partnerName,
    registrationNumber: source["Registration Number:"] ?? source.registrationNumber,
    policyNumber: source["Policy Number:"] ?? source.policyNumber,
    issueDate: source["Policy Issue Date"] ?? source.issueDate,
    mobileNumber: source["Mobile Number:"] ?? source.mobileNumber,
    address: source.Address ?? source.address,
    rtoLocation: source["RTO Location"] ?? source.rtoLocation,
    vehicleMake: source.Make ?? source.vehicleMake,
    vehicleModel: source["Model/Vehicle Variant (Sub-Type)"] ?? source.vehicleModel,
    engineNumber: source["Engine No."] ?? source.engineNumber,
    chassisNumber: source["Chassis No."] ?? source.chassisNumber,
    fuelType: source["Fuel Type"] ?? source.fuelType,
    yearOfManufacture: source["Year of Regn./ Manufacturing"] ?? source.yearOfManufacture,
    gvw: source.GVW ?? source.gvw,
    cubicCapacity: source["Cubic Capacity"] ?? source.cubicCapacity,
    totalIdv: source["Total IDV"] ?? source.totalIdv,
    ncb: source["NCB % (Current Policy)"] ?? source.ncb,
    riskStartDate: source.riskStartDate,
    renewalDate: source.renewalDate,
    totalOdPremium: source["Total OD Premium"] ?? source.totalOdPremium,
    totalActPremium: source["Total Act Premium"] ?? source.totalActPremium,
    netPremium: source["Net Premium"] ?? source.netPremium,
    totalAmount: source["Final Premium"] ?? source.totalAmount,
    previousPolicyNumber: source["Previous Policy No."] ?? source.previousPolicyNumber,
    paymentMode: source["Payment Mode"] ?? source.paymentMode,
    partnerCode: source["Partner Code :"] ?? source.partnerCode,
  };
  const output = createPolicy();
  output.Filename = fileName;
  output.InsuranceCompany = "Go Digit";
  output.LOB = "Private Car";
  output.Date = normalizeDate(fields.issueDate ?? "");
  output.CustomerName = value(fields.customerName);
  output.MobileNumber = value(fields.mobileNumber);
  output.Location = value(fields.address);
  output.RegistrationNumber = normalizeRegistration(value(fields.registrationNumber));
  output.RTOCode = normalizeRtoCode(value(fields.rtoLocation), output.RegistrationNumber);
  output.VehicleMake = value(fields.vehicleMake);
  output.VehicleModel = value(fields.vehicleModel);
  output.CubicCapacity = value(fields.cubicCapacity);
  output.GVW = value(fields.gvw);
  output.FuelType = value(fields.fuelType);
  output.YearOfManufacture = value(fields.yearOfManufacture);
  output.EngineNumber = value(fields.engineNumber);
  output.ChassisNumber = value(fields.chassisNumber);
  output.PolicyNumber = value(fields.policyNumber).split(/\s*\/\s*/)[0] ?? "";
  output.PrePolicyNo = value(fields.previousPolicyNumber);
  const idv = fields.totalIdv ?? "";
  output.IDV = normalizeAmount(idv);
  output.NCB = value(fields.ncb);
  output.RiskStartDate = normalizeDate(fields.riskStartDate ?? "");
  output.RenewalDate = normalizeDate(fields.renewalDate ?? "");
  output.ODPremium = normalizeAmount(fields.totalOdPremium ?? fields.ownDamagePremium ?? "");
  output.TPOnlyPremium = normalizeAmount(fields.totalActPremium ?? fields.thirdPartyPremium ?? "");
  output.NetPremium = normalizeAmount(fields.netPremium ?? "");
  output.TotalAmount = normalizeAmount(fields.totalAmount ?? "");
  output.ModeOfPayment = value(fields.paymentMode);
  output.IMDCode = value(fields.partnerCode);
  output.Package = numericAmount(normalizeAmount(fields.totalOdPremium ?? "")) > 0
    ? "Package"
    : "Liability";
  if (fields.partnerName?.toUpperCase().includes("HEUTE AND MORGEN"))
    output.Vertical = "HEUTE AND MORGEN INSURANCE";
  return output;
}

function value(input: string | undefined): string {
  return input?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeRegistration(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

function deriveRtoCode(registration: string): string {
  const match = /^([A-Z]{2}(?:\d{2}|\d[A-Z]))/.exec(registration);
  return match?.[1] ?? "";
}

function normalizeRtoCode(sourceLocation: string, registration: string): string {
  if (/^[A-Z]{2}(?:\d{2}|\d[A-Z])$/i.test(sourceLocation)) return sourceLocation.toUpperCase();
  return deriveRtoCode(registration);
}

function normalizeDate(input: string): string {
  const match = /\b(\d{1,2})[-/ ]([A-Za-z]{3}|\d{1,2})[-/ ](\d{4})\b/.exec(input);
  if (!match) return "";
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const month = /^\d+$/.test(match[2]!) ? Number(match[2]) : months.indexOf(match[2]!.toLowerCase()) + 1;
  const day = Number(match[1]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (month < 1 || month > 12 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeAmount(input: string): string {
  const match = input.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match?.[0] ?? "";
}

function numericAmount(input: string): number {
  return /^-?\d+(?:\.\d+)?$/.test(input) ? Number(input) : 0;
}
