import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PolicyData } from "../../format/policy.js";

export const POLICY_COLUMNS = [
  "Filename", "Status", "Date", "InsuranceCompany", "Vertical", "IMDCode", "LOB", "Package",
  "FuelType", "Renewal", "CustomerName", "MobileNumber", "Location", "RegistrationNumber",
  "RTOCode", "VehicleMake", "VehicleModel", "CubicCapacity", "GVW", "Bike_Scooter",
  "YearOfManufacture", "EngineNumber", "ChassisNumber", "PolicyNumber", "IssueOfficeCode",
  "PrePolicyNo", "IDV", "NCB", "RiskStartDate", "RenewalDate", "ODPremium", "TPOnlyPremium",
  "AddOnPremium", "NetPremium", "TotalAmount", "ModeOfPayment",
] as const satisfies readonly (keyof PolicyData)[];

function csvCell(value: string | boolean | undefined): string {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Writes records with the existing fixed 36-column header. */
export async function exportPoliciesToCsv(
  policies: readonly Partial<PolicyData>[],
  filePath: string,
): Promise<void> {
  const rows = [POLICY_COLUMNS.map(csvCell).join(",")];
  for (const policy of policies) {
    rows.push(POLICY_COLUMNS.map((column) => {
      if (column === "Status") return policy.Status === true ? "true" : "false";
      return csvCell(policy[column]);
    }).join(","));
  }
  await mkdir(path.dirname(path.resolve(filePath)), { recursive: true });
  await writeFile(filePath, `${rows.join("\r\n")}\r\n`, "utf8");
}
