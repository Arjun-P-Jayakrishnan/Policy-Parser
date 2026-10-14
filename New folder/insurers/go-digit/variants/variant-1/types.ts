/** Raw fields supported by the initial target, sample.pdf. */
export interface Variant1Fields {
  customerName?: string;
  partnerName?: string;
  registrationNumber?: string;
  policyNumber?: string;
  issueDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  mobileNumber?: string;
  partnerMobile?: string;
  address?: string;
  rtoLocation?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  engineNumber?: string;
  chassisNumber?: string;
  fuelType?: string;
  yearOfManufacture?: string;
  gvw?: string;
  cubicCapacity?: string;
  odometer?: string;
  totalIdv?: string;
  ncb?: string;
  riskStartDate?: string;
  renewalDate?: string;
  ownDamagePremium?: string;
  totalOdPremium?: string;
  totalActPremium?: string;
  thirdPartyPremium?: string;
  netPremium?: string;
  totalAmount?: string;
  previousPolicyNumber?: string;
  previousPolicyExpiryDate?: string;
  paymentMode?: string;
  partnerCode?: string;
}

export interface Variant1ParseResult {
  variant: "variant-1";
  fields: Record<string, string>;
}
