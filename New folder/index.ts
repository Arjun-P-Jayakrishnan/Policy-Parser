import path from "node:path";
import { writeFile } from "node:fs/promises";
import { parseDigitPolicyByPage, parseDigitPolicyFromLayout } from "./parsers/digit/parser.js";
import { extractAndReconstructPdf } from "./services/pdf-parser/extractor.js";
import { LayoutLine } from "./services/pdf-parser/types.js";

/** Main entry point to run the policy parser pipeline on a target PDF file. */
async function main() {
  try {
    const pdfPath = path.resolve("sample.pdf");
    console.log(`Processing policy: ${pdfPath}`);

    // Step 1: Extract text and reconstruct spatial reading layout
    const layout = await extractAndReconstructPdf(pdfPath);

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

    // Step 3: Run the template-driven sequential parser
    const policyData = parseDigitPolicyFromLayout(
      pagesMap,
      path.basename(pdfPath),
    );
    const fieldsByPage = parseDigitPolicyByPage(pagesMap);

    // Step 4: Write page-attributed parsed fields and final structured output.
    const outputPath = path.resolve("output.txt");
    const pageResults = [...pages.keys()].map((pageNumber) => {
      const fields = fieldsByPage.get(pageNumber) ?? {};
      const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
      return [
        `--- Page ${pageNumber}: parsed fields ---`,
        ...(entries.length > 0
          ? entries.map(([field, value]) => `${field}: ${value}`)
          : ["No policy fields extracted from this page."]),
        "",
      ].join("\n");
    }).join("\n");
    const output = `=== Parsed fields by page ===\n${pageResults}\n=== Final Parsed Policy JSON ===\n${JSON.stringify(policyData, null, 2)}\n`;
    await writeFile(outputPath, output, "utf8");
    console.log(`Successfully extracted policy data to ${outputPath}`);
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
