export interface Variant2Data {
  LOB: "TW";
  // Insured details
  customerName: string;
  mobileNumber: string;
  email: string;
  address: string;

  // Partner details
  partnerName: string;
  partnerCode: string;
  partnerMobileNumber: string;
  partnerEmail: string;

  // Policy details
  policyNumber: string;
  policyIssueDate: string;
  riskStartDate: string;
  riskEndDate: string;
  renewalDate: string;
  previousInsurer: string;
  previousPolicyNumber: string;
  previousPolicyExpiryDate: string;

  // Vehicle details
  registrationNumber: string;
  rtoLocation: string;
  vehicleMake: string;
  vehicleModel: string;
  seatingCapacity: string;
  fuelType: string;
  yearOfManufacture: string;
  engineNumber: string;
  chassisNumber: string;
  cubicCapacity: string;
  gvw: string;
  odometer: string;
  fastagNumber: string;
  bodyType: string;

  // Coverage and premium details
  gstin_uinno: string;
  idv: string;
  ncb: string;
  totalOdPremium: string;
  totalActPremium: string;
  tpOnlyPremium: string;
  addOnPremium: string;
  netPremium: string;
  finalPremium: string;
  igst: string;
  cgst: string;
  sgst: string;
  utgst: string;
  cess: string;
  grossPremium: string;
  totalAmount: string;

  // Payment and invoice details
  paymentMode: string;
  transactionNumber: string;
  receiptNumber: string;
  receiptDate: string;
  invoiceNumber: string;
  invoiceDate: string;

  //
  thirdPartyLiabilityStartDate: string;
  thirdPartyLiabilityEndDate: string;

  // Other policy details
  policyType: string;
  policyUin: string;
  imtEndorsements: string;
  gstin: string;
}
