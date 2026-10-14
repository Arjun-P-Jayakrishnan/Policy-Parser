import PDFParser from "pdf2json";
import type { PdfTextToken } from "./types.js";

/**
 * Extracts PDF text into library-independent tokens with 1-based page numbers.
 * Orchestrates loading the PDF via pdf2json and transforming the raw data structure.
 */
export function extractPdfText(pdfPath: string): Promise<PdfTextToken[]> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (error) => {
      const normalizedError =
        error instanceof Error ? error : error.parserError;
      reject(normalizedError);
    });

    parser.on("pdfParser_dataReady", (data) => {
      try {
        const tokens = parsePdfData(data);
        resolve(tokens);
      } catch (error) {
        reject(error);
      }
    });

    try {
      parser.loadPDF(pdfPath);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Parses the raw data object returned by pdf2json into an array of PdfTextTokens.
 * Pure transformation function over the raw JSON structure.
 */
function parsePdfData(data: {
  Pages?: Array<{ Texts?: any[] }>;
}): PdfTextToken[] {
  const tokens: PdfTextToken[] = [];
  const pages = data.Pages ?? [];

  pages.forEach((page, pageIndex) => {
    const pageNumber = pageIndex + 1;
    const pageTokens = extractPageTokens(page, pageNumber);
    tokens.push(...pageTokens);
  });

  return tokens;
}

/**
 * Extracts all valid text tokens from a single page object.
 * Pure mapping function.
 */
function extractPageTokens(
  page: { Texts?: any[] },
  pageNumber: number,
): PdfTextToken[] {
  const texts = page.Texts ?? [];
  const tokens: PdfTextToken[] = [];

  for (const block of texts) {
    const text = extractBlockText(block);
    if (!text) continue;

    tokens.push({
      page: pageNumber,
      x: Number(block.x),
      y: Number(block.y),
      text,
    });
  }

  return tokens;
}

/**
 * Extracts and decodes text runs from a single text block.
 * Pure transformation function.
 */
function extractBlockText(block: { R?: Array<{ T?: string }> }): string {
  const runs = block.R ?? [];

  return runs.map((run) => safeDecodeText(run.T)).join("");
}

/**
 * Safely decodes a URI-encoded text run, falling back to the raw string on failure.
 * Pure utility function.
 */
function safeDecodeText(encodedText: string | undefined): string {
  const text = encodedText ?? "";

  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}
