import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { detectInsurer } from "./insurers/detect_insurer.js";
import {
  detectGoDigitLayout,
  type GoDigitLayoutVariant,
} from "./insurers/go-digit/detect_variant.js";
import { blueprint as goDigitVariant1Blueprint } from "./insurers/go-digit/variant-1/blueprint.js";
import { normalize as normalizeGoDigitVariant1 } from "./insurers/go-digit/variant-1/normalize.js";
import type { Variant1Data } from "./insurers/go-digit/variant-1/types.js";
import { blueprint as goDigitVariant2Blueprint } from "./insurers/go-digit/variant-2/blueprint.js";
import { normalize as normalizeGoDigitVariant2 } from "./insurers/go-digit/variant-2/normalize.js";
import type { Variant2Data } from "./insurers/go-digit/variant-2/types.js";
import type { PolicyData } from "./format/policy.js";
import { exportPoliciesToCsv } from "./services/csv/convert.js";
import { parseDocument } from "./services/blueprint/parser.js";
import { extractAndReconstructPdf } from "./services/pdf-parser/extractor.js";
import type { PdfTextToken, ReconstructedLayout } from "./services/pdf-parser/types.js";

const pdfsDirectory = path.resolve("pdfs");
const logsDirectory = path.resolve("logs");
const logStages = ["extraction", "variant detection", "variant", "normaliser"];
const outputPath = path.resolve("output", "output.csv");

/** Main entry point to run the policy parser pipeline on a target PDF file. */
async function main(): Promise<void> {
  try {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await Promise.all(logStages.map((stage) => mkdir(path.join(logsDirectory, stage), { recursive: true })));
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
        const baseName = path.parse(filename).name;
        const layout = await extractAndReconstructPdf(sourcePath);
        await writeJsonLog("extraction", baseName, layout);
        const { insurer, variant } = detectDocument(layout);
        await writeJsonLog("variant detection", baseName, { insurer, variant });
        const { parsed, policy } = parseAndNormalize(layout, variant);
        await writeJsonLog(`variant/${variant}`, baseName, parsed);
        policy.Filename = filename;
        await writeJsonLog("normaliser", baseName, policy);
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

async function writeJsonLog(stage: string, baseName: string, value: unknown): Promise<void> {
  const stageDirectory = path.join(logsDirectory, stage);
  await mkdir(stageDirectory, { recursive: true });
  await writeFile(path.join(stageDirectory, `${baseName}.json`), `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
): { parsed: Variant1Data | Variant2Data; policy: PolicyData } {
  switch (variant) {
    case "variant-1": {
      const parsed = parseDocument(layout, goDigitVariant1Blueprint);
      return { parsed, policy: normalizeGoDigitVariant1(parsed) };
    }
    case "variant-2": {
      const parsed = parseDocument(layout, goDigitVariant2Blueprint);
      return { parsed, policy: normalizeGoDigitVariant2(parsed) };
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
