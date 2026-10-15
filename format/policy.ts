export const POLICY_FIELDS = [
  'Filename', 'Status', 'Date', 'InsuranceCompany', 'Vertical', 'IMDCode', 'LOB', 'Package',
  'FuelType', 'Renewal', 'CustomerName', 'MobileNumber', 'Location', 'RegistrationNumber',
  'RTOCode', 'VehicleMake', 'VehicleModel', 'CubicCapacity', 'GVW', 'Bike_Scooter',
  'YearOfManufacture', 'EngineNumber', 'ChassisNumber', 'PolicyNumber', 'IssueOfficeCode',
  'PrePolicyNo', 'IDV', 'NCB', 'RiskStartDate', 'RenewalDate', 'ODPremium', 'TPOnlyPremium',
  'AddOnPremium', 'NetPremium', 'TotalAmount', 'ModeOfPayment',
] as const;

export interface PolicyData {
  Filename: string;
  Status: boolean;
  Date: string;
  InsuranceCompany: string;
  Vertical: string;
  IMDCode: string;
  LOB: string;
  Package: string;
  FuelType: string;
  Renewal: string;
  CustomerName: string;
  MobileNumber: string;
  Location: string;
  RegistrationNumber: string;
  RTOCode: string;
  VehicleMake: string;
  VehicleModel: string;
  CubicCapacity: string;
  GVW: string;
  Bike_Scooter: string;
  YearOfManufacture: string;
  EngineNumber: string;
  ChassisNumber: string;
  PolicyNumber: string;
  IssueOfficeCode: string;
  PrePolicyNo: string;
  IDV: string;
  NCB: string;
  RiskStartDate: string;
  RenewalDate: string;
  ODPremium: string;
  TPOnlyPremium: string;
  AddOnPremium: string;
  NetPremium: string;
  TotalAmount: string;
  ModeOfPayment: string;
}

/** Factory for a fully initialized policy record. */
export function createPolicy(): PolicyData {
  return {
    Filename: '', Status: false, Date: '', InsuranceCompany: '', Vertical: '', IMDCode: '',
    LOB: '', Package: '', FuelType: '', Renewal: '', CustomerName: '', MobileNumber: '',
    Location: '', RegistrationNumber: '', RTOCode: '', VehicleMake: '', VehicleModel: '',
    CubicCapacity: '', GVW: '', Bike_Scooter: '', YearOfManufacture: '', EngineNumber: '',
    ChassisNumber: '', PolicyNumber: '', IssueOfficeCode: '', PrePolicyNo: '', IDV: '', NCB: '',
    RiskStartDate: '', RenewalDate: '', ODPremium: '', TPOnlyPremium: '', AddOnPremium: '',
    NetPremium: '', TotalAmount: '', ModeOfPayment: '',
  };
}
