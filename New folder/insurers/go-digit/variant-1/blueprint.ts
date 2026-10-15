import type { BlueprintEntry } from "../../../services/blueprint/types.js";
import type { PositionedPage } from "../../../services/pdf-parser/types.js";
import { extractValue, getRawData } from "../../../utils/blueprint-utils.js";
import type { Variant1Data } from "./types.js";

/**
 * Defines the PDF labels and extraction rules for Variant 1.
 */
export const blueprint: BlueprintEntry<Variant1Data>[] = [
  // Insured details
  {
    field: "customerName",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Name:/)),
  },
  {
    field: "mobileNumber",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Mobile Number:/)),
  },
  {
    field: "address",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Address/)),
  },

  // Partner details
  {
    field: "partnerName",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Partner Name:/)),
  },
  {
    field: "partnerCode",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Partner Code\s*:/)),
  },

  // Policy details
  {
    field: "policyNumber",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Policy Number:/)),
  },
  {
    field: "policyIssueDate",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Policy Issue Date/)),
  },
  {
    field: "previousPolicyNumber",
    page: 1,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Previous Policy No\./)),
  },

  // Vehicle details
  {
    field: "registrationNumber",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Registration Number:/)),
  },
  {
    field: "rtoLocation",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /RTO Location/)),
  },
  {
    field: "vehicleMake",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Make/)),
  },
  {
    field: "vehicleModel",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(
        page,
        getRawData(page, /Model\/Vehicle Variant \(Sub-Type\)/),
      ),
  },
  {
    field: "engineNumber",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Engine No\./)),
  },
  {
    field: "chassisNumber",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Chassis No\./)),
  },
  {
    field: "fuelType",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Fuel Type/)),
  },
  {
    field: "yearOfManufacture",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Year of Regn\.\/ Manufacturing/)),
  },
  {
    field: "gvw",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /GVW/)),
  },
  {
    field: "cubicCapacity",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Cubic Capacity/)),
  },

  // Coverage and premium details
  {
    field: "idv",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Total IDV/)),
  },
  {
    field: "ncb",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /NCB % \(Current Policy\)/)),
  },
  {
    field: "totalOdPremium",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Total OD Premium/)),
  },
  {
    field: "totalActPremium",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Total Act Premium/)),
  },
  {
    field: "netPremium",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Net Premium/)),
  },
  {
    field: "totalAmount",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Final Premium/)),
  },

  // Payment details
  {
    field: "paymentMode",
    page: 2,
    locateAndExtract: (page: PositionedPage) =>
      extractValue(page, getRawData(page, /Payment Mode/)),
  },
];
