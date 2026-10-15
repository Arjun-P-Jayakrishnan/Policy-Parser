import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { detectInsurer } from "./insurers/detect_insurer.js";
import {
  detectGoDigitLayout,
  type GoDigitLayoutVariant,
} from "./insurers/go-digit/detect_variant.js";
import { blueprint as goDigitVariant1Blueprint } from "./insurers/go-digit/variant-1/blueprint.js";
import { normalize as normalizeGoDigitVariant1 } from "./insurers/go-digit/variant-1/normalize.js";
import type { Variant1Data } from "./insurers/go-digit/variant-1/types.js";
import type { PolicyData } from "./format/policy.js";
import { exportPoliciesToCsv } from "./services/csv/convert.js";
import { parseDocument } from "./services/blueprint/parser.js";
import { extractAndReconstructPdf } from "./services/pdf-parser/extractor.js";
import type { PdfTextToken, ReconstructedLayout } from "./services/pdf-parser/types.js";

const pdfsDirectory = path.resolve("pdfs");
const outputPath = path.resolve("output", "output.csv");

/** Main entry point to run the policy parser pipeline on a target PDF file. */
async function main(): Promise<void> {
  try {
    await mkdir(path.dirname(outputPath), { recursive: true });
    const pdfFiles = (await readdir(pdfsDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".pdf")
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    if (pdfFiles.length === 0) throw new Error(`No PDF files found in ${pdfsDirectory}`);

    const policies: PolicyData[] = [];
    const failures: string[] = [];
    for (const filename of pdfFiles) {
      const sourcePath = path.join(pdfsDirectory, filename);
      console.log(`Processing policy: ${sourcePath}`);

      try {
        const layout = await extractAndReconstructPdf(sourcePath);
        const { insurer, variant } = detectDocument(layout);
        const { policy } = parseAndNormalize(layout, variant);
        policy.Filename = filename;
        policies.push(policy);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${filename}: ${message}`);
        console.error(`Failed to parse ${filename}: ${message}`);
      }
    }

    await exportPoliciesToCsv(policies, outputPath);
    console.log(`Wrote ${policies.length} parsed policy record(s) to ${outputPath}`);
    if (failures.length > 0) console.error(`Skipped ${failures.length} PDF(s):\n${failures.join("\n")}`);
  } catch (error) {
    console.error("Failed to parse policy:", error);
    process.exit(1);
  }
}

/** Detects the insurer and dispatches to that insurer's variant detector. */
function detectDocument(layout: ReconstructedLayout): {
  insurer: "go-digit";
  variant: GoDigitLayoutVariant;
} {
  const insurer = detectInsurer(flattenLayoutTokens(layout));
  if (!insurer) throw new Error("Unsupported insurer");

  switch (insurer) {
    case "go-digit": {
      const tokensByPage = new Map<number, PdfTextToken[]>();
      for (const token of flattenLayoutTokens(layout)) {
        const pageTokens = tokensByPage.get(token.page) ?? [];
        pageTokens.push(token);
        tokensByPage.set(token.page, pageTokens);
      }
      const variant = detectGoDigitLayout(tokensByPage);
      if (!variant) throw new Error("Unsupported Go Digit layout");
      return { insurer, variant };
    }
  }
}

/** Runs the selected variant's blueprint parser and normalizer. */
function parseAndNormalize(
  layout: ReconstructedLayout,
  variant: GoDigitLayoutVariant,
): { parsed: Variant1Data; policy: PolicyData } {
  switch (variant) {
    case "variant-1": {
      const parsed = parseDocument(layout, goDigitVariant1Blueprint);
      return { parsed, policy: normalizeGoDigitVariant1(parsed) };
    }
  }
}

/** Flattens the actual page/line/fragment layout into tokens for detectors. */
function flattenLayoutTokens(layout: ReconstructedLayout): PdfTextToken[] {
  return layout.pages.flatMap((page) =>
    page.y.flatMap((line) =>
      line.x.map(({ x, text }) => ({ page: page.page, x, y: line.y, text })),
    ),
  );
}

void main();
