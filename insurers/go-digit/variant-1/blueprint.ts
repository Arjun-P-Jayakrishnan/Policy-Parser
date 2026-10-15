import type { BlueprintEntry } from "../../../services/blueprint/types.js";
import type { PositionedPage } from "../../../services/pdf-parser/types.js";
import { extractValue, getRawData } from "../../../utils/blueprint-utils.js";
import type { Variant1Data } from "./types.js";

/**
 * Defines the PDF labels and extraction rules for Variant 1.
 */
export const blueprint: BlueprintEntry<Variant1Data>[] = [
  // Insured details
  { field: "customerName", page: 1, locateAndExtract: (page) => value(page, /(?<!Partner )Name:/) },
  { field: "email", page: 1, locateAndExtract: (page) => value(page, /Email:/) },
  {
    field: "mobileNumber",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /(?<!Partner )Mobile Number:/),
  },
  {
    field: "address",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /^Address$/),
  },

  // Partner details
  {
    field: "partnerName",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Partner Name:/),
  },
  {
    field: "partnerCode",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Partner Code\s*:/),
  },
  { field: "partnerMobileNumber", page: 1, locateAndExtract: (page) => value(page, /Partner Mobile Number:/) },
  { field: "partnerEmail", page: 1, locateAndExtract: (page) => value(page, /Partner Email\s*:/) },

  // Policy details
  {
    field: "policyNumber",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Policy Number:/),
  },
  {
    field: "policyIssueDate",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      valueRightOf(page, /Policy Issue Date/),
  },
  { field: "invoiceNumber", page: 1, locateAndExtract: (page) => value(page, /Invoice No\./) },
  { field: "invoiceDate", page: 1, locateAndExtract: (page) => value(page, /Invoice Date/) },
  { field: "riskStartDate", page: 1, locateAndExtract: (page) => valueAfter(page, /Period of Policy for/) },
  { field: "riskEndDate", page: 1, locateAndExtract: (page) => valueRightOf(page, /Own Damage Cover/, /To/) },
  { field: "renewalDate", page: 1, locateAndExtract: (page) => valueRightOf(page, /Third Party Liability/, /To/) },
  { field: "ncb", page: 1, locateAndExtract: (page) => valueRightOf(page, /NCB % \(Current Policy\)/) },
  {
    field: "previousPolicyNumber",
    page: 3,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Previous Policy No\./),
  },
  { field: "previousInsurer", page: 3, locateAndExtract: (page) => value(page, /Previous Insurer/, /Previous Policy No\./) },
  { field: "previousPolicyExpiryDate", page: 3, locateAndExtract: (page) => value(page, /Previous Policy Expiry Date/) },

  // Vehicle details
  {
    field: "registrationNumber",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Registration Number:/),
  },
  {
    field: "rtoLocation",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /RTO Location/),
  },
  {
    field: "vehicleMake",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /^Make$/),
  },
  {
    field: "vehicleModel",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Model\/Vehicle Variant/),
  },
  { field: "seatingCapacity", page: 2, locateAndExtract: (page) => value(page, /Seating Capacity/) },
  {
    field: "engineNumber",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      valueRightOf(page, /Engine No\./),
  },
  {
    field: "chassisNumber",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      valueRightOf(page, /Chassis No\./),
  },
  {
    field: "fuelType",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Fuel Type/),
  },
  {
    field: "yearOfManufacture",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Manufacturing/),
  },
  {
    field: "gvw",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /GVW/),
  },
  {
    field: "cubicCapacity",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Cubic Capacity/),
  },
  { field: "odometer", page: 2, locateAndExtract: (page) => value(page, /Odometer/) },
  { field: "fastagNumber", page: 2, locateAndExtract: (page) => value(page, /FASTag\s*Number\.?/) },

  // Coverage and premium details
  {
    field: "idv",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      valueRightOf(page, /Year 1/),
  },
  {
    field: "totalOdPremium",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Total OD Premium/, /Total Act Premium/),
  },
  {
    field: "totalActPremium",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Total Act Premium/),
  },
  {
    field: "netPremium",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      valueAtX(page, /Net Premium/, 17),
  },
  { field: "igst", page: 2, locateAndExtract: (page) => valueAtX(page, /IGST @18%=/i, 5.6).replace(/^[^\d]*/, "").replace(/\)$/, "") },
  { field: "cgst", page: 3, locateAndExtract: () => "0.00" },
  { field: "sgst", page: 3, locateAndExtract: () => "0.00" },
  { field: "utgst", page: 3, locateAndExtract: () => "0.00" },
  { field: "cess", page: 3, locateAndExtract: () => "0.00" },
  { field: "grossPremium", page: 2, locateAndExtract: (page) => valueAtX(page, /Final Premium/, 17) },
  {
    field: "totalAmount",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      value(page, /Final Premium/),
  },

  // Payment details
  {
    field: "paymentMode",
    page: 3,
    locateAndExtract: (page: PositionedPage) => valueRightOf(page, /Payment Mode/),
  },
  { field: "transactionNumber", page: 3, locateAndExtract: (page) => value(page, /Cheque\/Transation No/) },
  { field: "receiptNumber", page: 3, locateAndExtract: (page) => value(page, /Receipt Number/, /Receipt Date/) },
  { field: "receiptDate", page: 3, locateAndExtract: (page) => value(page, /Receipt Date/) },
  { field: "policyType", page: 1, locateAndExtract: (page) => page.y.flatMap(line => line.x).map(token => token.text).find(text => text === "Digit Private Car Policy") ?? "" },
  { field: "policyUin", page: 1, locateAndExtract: (page) => value(page, /UIN No\.:/) },
  { field: "imtEndorsements", page: 3, locateAndExtract: (page) => value(page, /IMT\s*-\s*Endorsements/) },
  { field: "gstin", page: 3, locateAndExtract: (page) => value(page, /GSTIN\/UIN No\./, /State Code/) },
];

function value(
  page: PositionedPage,
  label: RegExp,
  boundary?: RegExp,
): string {
  return extractValue(page, getRawData(page, label), boundary);
}

function valueRightOf(
  page: PositionedPage,
  label: RegExp,
  valueLabel?: RegExp,
): string {
  for (const line of page.y) {
    const fragments = [...line.x].sort((a, b) => a.x - b.x);
    const labelIndex = fragments.findIndex((fragment) => {
      label.lastIndex = 0;
      return label.test(fragment.text);
    });
    if (labelIndex < 0) continue;
    const valueIndex = valueLabel
      ? fragments.findIndex((fragment, index) => {
          valueLabel.lastIndex = 0;
          return index > labelIndex && valueLabel.test(fragment.text);
        }) + 1
      : labelIndex + 1;
    return fragments[valueIndex]?.text.trim() ?? "";
  }
  return "";
}

function valueAtX(page: PositionedPage, label: RegExp, x: number): string {
  const line = page.y.find((candidate) =>
    candidate.x.some((fragment) => {
      label.lastIndex = 0;
      return label.test(fragment.text);
    }),
  );
  return line?.x.find((fragment) => fragment.x >= x)?.text.trim() ?? "";
}

function valueAfter(page: PositionedPage, label: RegExp): string {
  for (const line of page.y) {
    const fragments = [...line.x].sort((a, b) => a.x - b.x);
    const labelIndex = fragments.findIndex((fragment) => {
      label.lastIndex = 0;
      return label.test(fragment.text);
    });
    if (labelIndex < 0) continue;
    const fromIndex = fragments.findIndex((fragment, index) => index > labelIndex && fragment.text.trim() === "From");
    return fragments[fromIndex + 1]?.text.trim() ?? "";
  }
  return "";
}
