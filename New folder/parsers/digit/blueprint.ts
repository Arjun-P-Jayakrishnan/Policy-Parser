export interface BlueprintStep {
  field: string;
  anchor: string;
  extract: boolean;
  multiLine?: boolean;
}

/** Defines the ordered sequential blueprint for parsing Go Digit policy pages. */
export const GoDigitBlueprints: Record<number, BlueprintStep[]> = {
  1: [
    { field: "CustomerName", anchor: "Name:", extract: true },
    {
      field: "RegistrationNumber",
      anchor: "Registration Number:",
      extract: true,
    },
    { field: "PolicyNumber", anchor: "Policy Number:", extract: true },
    { field: "IGNORE", anchor: "YOUR POLICY DETAILS", extract: false },
    { field: "Date", anchor: "Policy Issue Date", extract: true },
    { field: "IGNORE", anchor: "Period of Policy for", extract: false },
    { field: "MobileNumber", anchor: "Mobile Number:", extract: true },
    { field: "Location", anchor: "Address", extract: true, multiLine: true },
  ],
  2: [
    { field: "IGNORE", anchor: "YOUR VEHICLE DETAILS", extract: false },
    { field: "RTOCode", anchor: "RTO Location", extract: true },
    { field: "VehicleMake", anchor: "Make", extract: true },
    {
      field: "VehicleModel",
      anchor: "Model/Vehicle Variant (Sub-",
      extract: true,
      multiLine: true,
    },
    { field: "CubicCapacity", anchor: "Cubic Capacity", extract: true },
    { field: "EngineNumber", anchor: "Engine No.", extract: true },
    { field: "ChassisNumber", anchor: "Chassis No.", extract: true },
    { field: "IGNORE", anchor: "OWN DAMAGE PREMIUM", extract: false },
    { field: "NetPremium", anchor: "Net Premium", extract: true },
    { field: "TotalAmount", anchor: "Final Premium", extract: true },
  ],
  3: [
    { field: "PrePolicyNo", anchor: "Previous Policy No.", extract: true },
    { field: "ModeOfPayment", anchor: "Payment Mode", extract: true },
  ],
};
