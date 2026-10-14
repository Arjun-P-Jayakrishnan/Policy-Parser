import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { parseGoDigitVariant1 } from "./insurers/go-digit/index.js";
import { extractAndReconstructPdf } from "./services/pdf-parser/extractor.js";
import { exportPoliciesToCsv } from "./services/csv/convert.js";
import { LayoutLine } from "./services/pdf-parser/types.js";
import { formatPositionedOutput } from "./services/pdf-parser/positioned-output.js";
import { detectInsurer } from "./insurers/detect.js";
import { detectGoDigitLayout } from "./insurers/go-digit/variants/detect.js";

/** Main entry point to run the policy parser pipeline on a target PDF file. */
async function main() {
  try {
    const pdfPath = path.resolve("sample.pdf");
    const logsDirectory = path.resolve("logs");
    await mkdir(logsDirectory, { recursive: true });
    console.log(`Processing policy: ${pdfPath}`);

    // Step 1: Extract text and reconstruct spatial reading layout
    const layout = await extractAndReconstructPdf(pdfPath);

    const extractionPath = path.join(logsDirectory, "1-extraction-output.txt");
    const positionedOutput = formatPositionedOutput(layout);
    await writeFile(extractionPath, `${JSON.stringify(positionedOutput, null, 2)}\n`, "utf8");

    const pages = groupLinesByPage(layout.lines);
    console.log(`Extracted ${layout.tokens.length} text tokens across ${pages.size} page(s).`);
    for (const [pageNumber, lines] of pages) {
      console.log(`\n--- Page ${pageNumber}: ${lines.length} reconstructed line(s) ---`);
      for (const [lineIndex, line] of lines.entries()) {
        const xPositions = line.tokens.map((token) => token.x.toFixed(2)).join(", ");
        console.log(`Line ${lineIndex + 1} Y [${line.y.toFixed(2)}] X [${xPositions}] Text - [${line.text}]`);
      }
    }

    // Step 2: Group layout lines into a Map keyed by page number
    const pagesMap = pages;
    const insurer = detectInsurer(layout.tokens);
    if (insurer !== "go-digit") throw new Error("Unsupported insurer");
    const detectedLayout = detectGoDigitLayout(pagesMap);
    if (detectedLayout !== "variant-1") throw new Error("Unsupported Go Digit layout");

    // Step 3: Parse the initial target with its explicit Variant 1 rules.
    const variant = detectedLayout;
    const variantPath = path.join(logsDirectory, "2-variant-detection.txt");
    await writeFile(variantPath, `${JSON.stringify({ variant, source: path.basename(pdfPath) }, null, 2)}\n`, "utf8");

    const { parsed, normalized: policyData } = parseGoDigitVariant1(pagesMap, path.basename(pdfPath));
    const parserPath = path.join(logsDirectory, "3-parser-output.txt");
    await writeFile(parserPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

    const normalizerPath = path.join(logsDirectory, "4-normalizer-output.txt");
    const normalizedOutput = `${JSON.stringify(policyData, null, 2)}\n`;
    await writeFile(normalizerPath, normalizedOutput, "utf8");

    // Keep the existing final output file for compatibility.
    const outputPath = path.join(logsDirectory, "5-final-output.txt");
    await writeFile(outputPath, `=== Final Parsed Policy JSON ===\n${normalizedOutput}`, "utf8");
    const csvPath = path.resolve("output", "policies.csv");
    await exportPoliciesToCsv([policyData], csvPath);
    console.log(`Wrote extraction stage to ${extractionPath}`);
    console.log(`Wrote variant detection to ${variantPath}`);
    console.log(`Wrote parser stage to ${parserPath}`);
    console.log(`Wrote normalized record to ${normalizerPath}`);
    console.log(`Wrote final record to ${outputPath}`);
    console.log(`Wrote CSV record to ${csvPath}`);
  } catch (error) {
    console.error("Failed to parse policy:", error);
    process.exit(1);
  }
}

/** Groups an array of layout lines into a Map based on their page number. */
function groupLinesByPage(
  lines: readonly LayoutLine[],
): Map<number, readonly LayoutLine[]> {
  const pages = new Map<number, LayoutLine[]>();

  for (const line of lines) {
    const pageLines = pages.get(line.page) ?? [];
    pageLines.push(line);
    pages.set(line.page, pageLines);
  }

  return pages;
}

// Execute the main pipeline
main();
