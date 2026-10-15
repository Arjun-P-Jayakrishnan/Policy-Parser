import { mkdir, writeFile } from "node:fs/promises";
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

const sourcePath = path.resolve("sample.pdf");
const logsDirectory = path.resolve("logs");

/** Main entry point to run the policy parser pipeline on a target PDF file. */
async function main(): Promise<void> {
  try {
    await mkdir(logsDirectory, { recursive: true });
    console.log(`Processing policy: ${sourcePath}`);

    const layout = await extractLayout(sourcePath);
    const { insurer, variant } = detectDocument(layout);
    const { parsed, policy } = parseAndNormalize(layout, variant);
    await savePipelineOutputs(sourcePath, layout, insurer, variant, parsed, policy);
    await exportPolicy(policy);
  } catch (error) {
    console.error("Failed to parse policy:", error);
    process.exit(1);
  }
}

/** Extracts the PDF into the shared spatial layout representation. */
async function extractLayout(pdfPath: string): Promise<ReconstructedLayout> {
  const layout = await extractAndReconstructPdf(pdfPath);
  const extractionPath = path.join(logsDirectory, "1-extraction-output.txt");
  await writeFile(extractionPath, formatExtractionOutput(layout), "utf8");
  const lineCount = layout.pages.reduce((count, page) => count + page.y.length, 0);
  console.log(
    `Extracted ${layout.pages.length} page(s) and ${lineCount} reconstructed line(s).`,
  );
  return layout;
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

/** Saves variant, parser, normalized, and compatibility final snapshots. */
async function savePipelineOutputs(
  pdfPath: string,
  layout: ReconstructedLayout,
  insurer: string,
  variant: GoDigitLayoutVariant,
  parsed: Variant1Data,
  policy: PolicyData,
): Promise<void> {
  const outputFiles: Array<[string, string]> = [
    [
      "2-variant-detection.txt",
      JSON.stringify({ insurer, variant, source: path.basename(pdfPath) }, null, 2),
    ],
    ["3-parser-output.txt", JSON.stringify(parsed, null, 2)],
    ["4-normalizer-output.txt", JSON.stringify(policy, null, 2)],
    ["5-final-output.txt", `=== Final Parsed Policy JSON ===\n${JSON.stringify(policy, null, 2)}\n`],
  ];

  for (const [filename, content] of outputFiles) {
    const filePath = path.join(logsDirectory, filename);
    await writeFile(filePath, `${content}\n`, "utf8");
    console.log(`Wrote ${filename}`);
  }
  console.log(
    `Parsed ${layout.pages.length} reconstructed page(s) for ${insurer} ${variant}.`,
  );
}

/** Exports the normalized policy using the existing CSV schema and destination. */
async function exportPolicy(policy: PolicyData): Promise<void> {
  const csvPath = path.resolve("output", "policies.csv");
  await exportPoliciesToCsv([policy], csvPath);
  console.log(`Wrote CSV record to ${csvPath}`);
}

/** Flattens the actual page/line/fragment layout into tokens for detectors. */
function flattenLayoutTokens(layout: ReconstructedLayout): PdfTextToken[] {
  return layout.pages.flatMap((page) =>
    page.y.flatMap((line) =>
      line.x.map(({ x, text }) => ({ page: page.page, x, y: line.y, text })),
    ),
  );
}

/** Formats the layout snapshot with the prior human-readable line diagnostics. */
function formatExtractionOutput(layout: ReconstructedLayout): string {
  const pages = layout.pages.map((page) => ({
    page: page.page,
    lines: page.y.map((line) => ({
      y: line.y,
      tokens: line.x.map((fragment) => ({
        x: fragment.x,
        text: fragment.text,
      })),
      text: line.x.map((fragment) => fragment.text).join(" "),
    })),
  }));
  const lines = [
    `Extracted ${flattenLayoutTokens(layout).length} text tokens across ${pages.length} page(s).`,
    ...pages.flatMap(({ page, lines: pageLines }) => [
      `\n--- Page ${page}: ${pageLines.length} reconstructed line(s) ---`,
      ...pageLines.map((line, index) => {
        const xPositions = line.tokens.map(({ x }) => x.toFixed(2)).join(", ");
        return `Line ${index + 1} Y [${line.y.toFixed(2)}] X [${xPositions}] Text - [${line.text}]`;
      }),
    ]),
  ];
  return `${JSON.stringify({ pages }, null, 2)}\n\n${lines.join("\n")}\n`;
}

void main();
