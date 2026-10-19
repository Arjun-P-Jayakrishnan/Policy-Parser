import type { BlueprintEntry } from "../../../services/blueprint/types.js";
import type { PdfTextToken } from "../../../services/pdf-parser/types.js";
import type { Variant1Data } from "./types.js";

interface TokenLine {
  page: number;
  y: number;
  tokens: PdfTextToken[];
}

/**
 * Defines the PDF labels and extraction rules for Variant 1.
 */
export const blueprint: BlueprintEntry<Variant1Data>[] = [
  // Insured details
  {
    field: "customerName",
    locateAndExtract: (tokens) => value(tokens, /(?<!Partner )Name:/),
  },
  { field: "email", locateAndExtract: (tokens) => value(tokens, /Email:/) },
  {
    field: "mobileNumber",
    locateAndExtract: (tokens) => value(tokens, /(?<!Partner )Mobile Number:/),
  },
  {
    field: "address",
    locateAndExtract: (tokens) => value(tokens, /^Address$/),
  },

  // Partner details
  {
    field: "partnerName",
    locateAndExtract: (tokens) => value(tokens, /Partner Name:/),
  },
  {
    field: "partnerCode",
    locateAndExtract: (tokens) =>
      value(tokens, /Partner Code\s*:/, undefined, 1),
  },
  {
    field: "partnerMobileNumber",
    locateAndExtract: (tokens) => value(tokens, /Partner Mobile Number:/),
  },
  {
    field: "partnerEmail",
    locateAndExtract: (tokens) => value(tokens, /Partner Email\s*:/),
  },

  // Policy details
  {
    field: "policyNumber",
    locateAndExtract: (tokens) => value(tokens, /Policy Number:/),
  },
  {
    field: "policyIssueDate",
    locateAndExtract: (tokens) => valueRightOf(tokens, /Policy Issue Date/),
  },
  {
    field: "invoiceNumber",
    locateAndExtract: (tokens) => value(tokens, /Invoice No\./),
  },
  {
    field: "invoiceDate",
    locateAndExtract: (tokens) => value(tokens, /Invoice Date/),
  },
  {
    field: "riskStartDate",
    locateAndExtract: (tokens) => valueAfter(tokens, /Period of Policy for/),
  },
  {
    field: "riskEndDate",
    locateAndExtract: (tokens) =>
      valueRightOf(tokens, /Own Damage Cover/, /To/),
  },
  {
    field: "renewalDate",
    locateAndExtract: (tokens) =>
      valueRightOf(tokens, /Third Party Liability/, /To/),
  },
  {
    field: "ncb",
    locateAndExtract: (tokens) =>
      valueRightOf(tokens, /NCB % \(Current Policy\)/),
  },
  {
    field: "previousPolicyNumber",
    locateAndExtract: (tokens) => value(tokens, /Previous Policy No\./),
  },
  {
    field: "previousInsurer",
    locateAndExtract: (tokens) =>
      value(tokens, /Previous Insurer/, /Previous Policy No\./),
  },
  {
    field: "previousPolicyExpiryDate",
    locateAndExtract: (tokens) => value(tokens, /Previous Policy Expiry Date/),
  },

  // Vehicle details
  {
    field: "registrationNumber",
    locateAndExtract: (tokens) => value(tokens, /Registration Number:/),
  },
  {
    field: "rtoLocation",
    locateAndExtract: (tokens) => value(tokens, /RTO Location/),
  },
  {
    field: "vehicleMake",
    locateAndExtract: (tokens) => value(tokens, /^Make$/),
  },
  {
    field: "vehicleModel",
    locateAndExtract: (tokens) =>
      value(tokens, /Model\/Vehicle Variant/, undefined, 3, true),
  },
  {
    field: "seatingCapacity",
    locateAndExtract: (tokens) => value(tokens, /Seating Capacity/),
  },
  {
    field: "engineNumber",
    locateAndExtract: (tokens) => valueRightOf(tokens, /Engine No\./),
  },
  {
    field: "chassisNumber",
    locateAndExtract: (tokens) => valueRightOf(tokens, /Chassis No\./),
  },
  {
    field: "fuelType",
    locateAndExtract: (tokens) => value(tokens, /Fuel Type/),
  },
  {
    field: "yearOfManufacture",
    locateAndExtract: (tokens) => value(tokens, /Manufacturing/),
  },
  {
    field: "gvw",
    locateAndExtract: (tokens) => value(tokens, /GVW/),
  },
  {
    field: "cubicCapacity",
    locateAndExtract: (tokens) => value(tokens, /Cubic Capacity/),
  },
  {
    field: "odometer",
    locateAndExtract: (tokens) => value(tokens, /Odometer/),
  },
  {
    field: "fastagNumber",
    locateAndExtract: (tokens) => value(tokens, /FASTag\s*Number\.?/),
  },

  // Coverage and premium details
  {
    field: "idv",
    locateAndExtract: (tokens) => valueRightOf(tokens, /Year 1/),
  },
  {
    field: "totalOdPremium",
    locateAndExtract: (tokens) =>
      value(tokens, /Total OD Premium/, /Total Act Premium/),
  },
  {
    field: "totalActPremium",
    locateAndExtract: (tokens) =>
      value(tokens, /Total Act Premium/, undefined, 2),
  },
  {
    field: "netPremium",
    locateAndExtract: (tokens) => valueAtX(tokens, /Net Premium/, 17),
  },
  {
    field: "finalPremium",
    locateAndExtract: (tokens) => valueAtX(tokens, /Final Premium/, 17),
  },
  {
    field: "igst",
    locateAndExtract: (tokens) =>
      valueAtX(tokens, /IGST @18%=/i, 5.6)
        .replace(/^[^\d]*/, "")
        .replace(/\)$/, ""),
  },
  { field: "cgst", locateAndExtract: () => "0.00" },
  { field: "sgst", locateAndExtract: () => "0.00" },
  { field: "utgst", locateAndExtract: () => "0.00" },
  { field: "cess", locateAndExtract: () => "0.00" },
  {
    field: "grossPremium",
    locateAndExtract: (tokens) => valueAtX(tokens, /Final Premium/, 17),
  },
  {
    field: "totalAmount",
    locateAndExtract: (tokens) => value(tokens, /Final Premium/),
  },

  // Payment details
  {
    field: "paymentMode",
    locateAndExtract: (tokens) => valueRightOf(tokens, /Payment Mode/),
  },
  {
    field: "transactionNumber",
    locateAndExtract: (tokens) => value(tokens, /Cheque\/Transation No/),
  },
  {
    field: "receiptNumber",
    locateAndExtract: (tokens) =>
      value(tokens, /Receipt Number/, /Receipt Date/),
  },
  {
    field: "receiptDate",
    locateAndExtract: (tokens) => value(tokens, /Receipt Date/),
  },
  {
    field: "policyType",
    locateAndExtract: (tokens) =>
      tokens.find((token) => token.text === "Digit Private Car Policy")?.text ??
      "",
  },
  {
    field: "policyUin",
    locateAndExtract: (tokens) => value(tokens, /UIN No\.:/),
  },
  {
    field: "imtEndorsements",
    locateAndExtract: (tokens) => value(tokens, /IMT\s*-\s*Endorsements/),
  },
  {
    field: "gstin",
    locateAndExtract: (tokens) =>
      value(tokens, /GSTIN\/UIN No\./, /State Code/),
  },
];

function value(
  tokens: readonly PdfTextToken[],
  label: RegExp,
  boundary?: RegExp,
  tokenCount = 1,
  includeNextY = false,
): string {
  const lines = toLines(tokens);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const labelIndex = line.tokens.findIndex((token) =>
      test(label, token.text),
    );
    if (labelIndex < 0) continue;
    const labelToken = line.tokens[labelIndex];
    const labelRemainder = labelToken.text.slice(
      line.tokens[labelIndex].text.search(label) +
        line.tokens[labelIndex].text.match(label)![0].length,
    );
    const following = line.tokens.slice(labelIndex + 1);

    // A numeric count means take that many complete fragments after the label.
    if (!boundary) {
      const fragments = [labelRemainder, ...following.map((token) => token.text)]
        .map((text) => text.trim())
        .filter(Boolean);
      if (includeNextY && fragments.length < tokenCount) {
        for (const nextLine of lines.slice(lineIndex + 1)) {
          if (nextLine.page !== line.page) break;
          if (looksLikeLabel(nextLine.tokens[0]?.text ?? "")) break;
          fragments.push(...nextLine.tokens.map((token) => token.text.trim()).filter(Boolean));
          if (fragments.length >= tokenCount) break;
        }
      }
      return fragments.slice(0, Math.max(0, tokenCount)).join(" ");
    }

    // A boundary regex means collect text until the next matching label/value.
    const values = [labelRemainder, ...following.map((token) => token.text)];
    for (const nextLine of lines.slice(lineIndex + 1)) {
      if (
        nextLine.page !== line.page ||
        looksLikeLabel(nextLine.tokens[0]?.text ?? "")
      )
        break;
      values.push(...nextLine.tokens.map((token) => token.text));
    }
    const text = values.join(" ").trim();
    const boundaryMatch = execRegex(boundary, text);
    return boundaryMatch ? text.slice(0, boundaryMatch.index).trim() : text;
  }
  return "";
}

function valueRightOf(
  tokens: readonly PdfTextToken[],
  label: RegExp,
  valueLabel?: RegExp,
): string {
  for (const line of toLines(tokens)) {
    const fragments = line.tokens;
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

/** Returns fragments immediately before a label, optionally spanning prior y lines. */
function valueLeftOf(
  tokens: readonly PdfTextToken[],
  label: RegExp,
  tokenCount = 1,
  includePreviousY = false,
): string {
  const lines = toLines(tokens);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const labelIndex = line.tokens.findIndex((token) => test(label, token.text));
    if (labelIndex < 0) continue;

    const fragments = line.tokens
      .slice(0, labelIndex)
      .map((token) => token.text.trim())
      .filter(Boolean)
      .reverse();

    if (includePreviousY && fragments.length < tokenCount) {
      for (const previousLine of lines.slice(0, lineIndex).reverse()) {
        if (previousLine.page !== line.page) break;
        if (looksLikeLabel(previousLine.tokens.at(-1)?.text ?? "")) break;
        fragments.push(
          ...previousLine.tokens
            .map((token) => token.text.trim())
            .filter(Boolean)
            .reverse(),
        );
        if (fragments.length >= tokenCount) break;
      }
    }

    return fragments
      .slice(0, Math.max(0, tokenCount))
      .reverse()
      .join(" ");
  }
  return "";
}

function valueAtX(
  tokens: readonly PdfTextToken[],
  label: RegExp,
  x: number,
): string {
  const line = toLines(tokens).find((candidate) =>
    candidate.tokens.some((token) => test(label, token.text)),
  );
  return line?.tokens.find((token) => token.x >= x)?.text.trim() ?? "";
}

function valueAfter(tokens: readonly PdfTextToken[], label: RegExp): string {
  for (const line of toLines(tokens)) {
    const fragments = line.tokens;
    const labelIndex = fragments.findIndex((fragment) => {
      label.lastIndex = 0;
      return label.test(fragment.text);
    });
    if (labelIndex < 0) continue;
    const fromIndex = fragments.findIndex(
      (fragment, index) =>
        index > labelIndex && fragment.text.trim() === "From",
    );
    return fragments[fromIndex + 1]?.text.trim() ?? "";
  }
  return "";
}

function toLines(tokens: readonly PdfTextToken[]): TokenLine[] {
  const lines = new Map<string, TokenLine>();
  for (const token of tokens) {
    const key = `${token.page}:${token.y}`;
    const line = lines.get(key) ?? { page: token.page, y: token.y, tokens: [] };
    line.tokens.push(token);
    lines.set(key, line);
  }
  return [...lines.values()]
    .map((line) => ({ ...line, tokens: line.tokens.sort((a, b) => a.x - b.x) }))
    .sort((a, b) => a.page - b.page || a.y - b.y);
}

function test(regex: RegExp, text: string): boolean {
  regex.lastIndex = 0;
  return regex.test(text);
}

function execRegex(regex: RegExp, text: string): RegExpExecArray | null {
  regex.lastIndex = 0;
  return regex.exec(text);
}

function looksLikeLabel(text: string): boolean {
  return /:$/.test(text.trim());
}
