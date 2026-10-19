import { PolicyData, createPolicy } from "../../../format/policy.js";
import {
  normalizeAmount,
  normalizeDate,
  normalizeRegistration,
  normalizeText,
} from "../../../utils/normalization.js";
import type { Variant2Data } from "./types.js";

export function normalize(data: Variant2Data): PolicyData {
  const policy = createPolicy();
  policy.InsuranceCompany = "Go Digit General Insurance";
  policy.Vertical = "HEUTE AND MORGEN";
  policy.LOB = data.LOB;
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
  policy.RiskStartDate = normalizeDate(data.thirdPartyLiabilityStartDate);
  policy.RenewalDate = normalizeDate(data.thirdPartyLiabilityEndDate);
  policy.Renewal = data.previousPolicyNumber ? "Renewal" : "New";

  // Vehicle details
  policy.RegistrationNumber =
    normalizeRegistration(data.gstin_uinno) === "Unregistered"
      ? "NEW"
      : normalizeRegistration(data.registrationNumber);
  policy.RTOCode = "";
  policy.VehicleMake = normalizeText(data.vehicleMake);
  policy.VehicleModel = normalizeText(data.vehicleModel);
  policy.EngineNumber = normalizeText(data.engineNumber);
  policy.ChassisNumber = normalizeText(data.chassisNumber);
  policy.FuelType = normalizeText(data.fuelType);
  policy.YearOfManufacture = normalizeText(data.yearOfManufacture);
  policy.GVW = normalizeText(data.gvw);
  policy.CubicCapacity = normalizeText(data.cubicCapacity);
  policy.Bike_Scooter =
    normalizeText(data.bodyType) === "Motor Cycle" ? "Bike" : " Scooter";

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
