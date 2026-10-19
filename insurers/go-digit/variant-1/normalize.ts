import { PolicyData, createPolicy } from "../../../format/policy.js";
import {
  normalizeAmount,
  normalizeDate,
  normalizeRegistration,
  normalizeText,
} from "../../../utils/normalization.js";
import type { Variant1Data } from "./types.js";

export function normalize(data: Variant1Data): PolicyData {
  const policy = createPolicy();
  policy.InsuranceCompany = "Go Digit General Insurance";
  policy.Vertical = "Motor";
  policy.LOB = "PVT";
  policy.Package = normalizeText(data.policyType);
  policy.Filename = "";

  // Insured details
  policy.CustomerName = normalizeText(data.customerName);
  policy.MobileNumber = normalizeText(data.mobileNumber);
  policy.Location = normalizeText(data.address);

  // Partner details
  policy.IMDCode = normalizeText(data.partnerCode);

  // Policy details
  policy.PolicyNumber = normalizeText(data.policyNumber);
  policy.Date = normalizeDate(data.policyIssueDate);
  policy.PrePolicyNo = normalizeText(data.previousPolicyNumber);
  policy.RiskStartDate = normalizeDate(data.riskStartDate);
  policy.RenewalDate = normalizeDate(data.riskEndDate);
  policy.Renewal = data.previousPolicyNumber ? "Renewal" : "New";

  // Vehicle details
  policy.RegistrationNumber = normalizeRegistration(data.registrationNumber);
  policy.RTOCode = "";
  policy.VehicleMake = normalizeText(data.vehicleMake);
  policy.VehicleModel = normalizeText(data.vehicleModel);
  policy.EngineNumber = normalizeText(data.engineNumber);
  policy.ChassisNumber = normalizeText(data.chassisNumber);
  policy.FuelType = normalizeText(data.fuelType);
  policy.YearOfManufacture = normalizeText(data.yearOfManufacture);
  policy.GVW = normalizeText(data.gvw);
  policy.CubicCapacity = normalizeText(data.cubicCapacity);

  // Coverage and premium details
  policy.IDV = normalizeAmount(data.idv ?? "");
  policy.NCB = normalizeText(data.ncb);
  policy.ODPremium = normalizeAmount(data.totalOdPremium ?? "");
  policy.TPOnlyPremium = normalizeAmount(
    data.tpOnlyPremium || data.totalActPremium || "",
  );
  policy.AddOnPremium = normalizeAmount(data.addOnPremium ?? "");
  policy.NetPremium = normalizeAmount(data.netPremium ?? "");
  policy.TotalAmount = normalizeAmount(data.finalPremium);

  // Payment details
  policy.ModeOfPayment = normalizeText(data.paymentMode);

  return policy;
}
