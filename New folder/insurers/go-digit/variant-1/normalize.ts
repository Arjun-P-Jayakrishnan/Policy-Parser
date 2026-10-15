import { PolicyData, createPolicy } from "../../../format/policy.js";
import type { Variant1Data } from "./types.js";

export function normalize(data: Variant1Data): PolicyData {
  const policy = createPolicy();

  // Insured details
  policy.CustomerName = normalizeText(data.customerName);
  policy.MobileNumber = normalizeText(data.mobileNumber);
  policy.Location = normalizeText(data.address);

  // Partner details
  policy.IMDCode = normalizeText(data.partnerCode);

  // Policy details
  policy.PolicyNumber = normalizeText(data.policyNumber);
  policy.Date = normalizeText(data.policyIssueDate);
  policy.PrePolicyNo = normalizeText(data.previousPolicyNumber);

  // Vehicle details
  policy.RegistrationNumber = normalizeText(data.registrationNumber);
  policy.RTOCode = normalizeText(data.rtoLocation);
  policy.VehicleMake = normalizeText(data.vehicleMake);
  policy.VehicleModel = normalizeText(data.vehicleModel);
  policy.EngineNumber = normalizeText(data.engineNumber);
  policy.ChassisNumber = normalizeText(data.chassisNumber);
  policy.FuelType = normalizeText(data.fuelType);
  policy.YearOfManufacture = normalizeText(data.yearOfManufacture);
  policy.GVW = normalizeText(data.gvw);
  policy.CubicCapacity = normalizeText(data.cubicCapacity);

  // Coverage and premium details
  policy.IDV = normalizeText(data.idv);
  policy.NCB = normalizeText(data.ncb);
  policy.ODPremium = normalizeText(data.totalOdPremium);
  policy.TPOnlyPremium = normalizeText(data.totalActPremium);
  policy.NetPremium = normalizeText(data.netPremium);
  policy.TotalAmount = normalizeText(data.totalAmount);

  // Payment details
  policy.ModeOfPayment = normalizeText(data.paymentMode);

  return policy;
}

function normalizeText(value: string): string {
  return value.trim();
}
