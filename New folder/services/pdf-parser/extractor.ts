import PDFParser from "pdf2json";
import type {
    LayoutLine,
    LayoutOptions,
    PdfTextToken,
    ReconstructedLayout,
} from "./types.js";

/**
 * Extracts PDF text into library-independent tokens and reconstructs them
 * into page-local layout lines sorted in logical reading order.
 */
export async function extractAndReconstructPdf(
  pdfPath: string,
  options: LayoutOptions = {},
): Promise<ReconstructedLayout> {
  const rawTokens = await extractPdfText(pdfPath);
  return reconstructLayout(rawTokens, options);
}

/**
 * ============================================================================
 *  RAW EXTRACTION (pdf2json wrapper)
 * ============================================================================
 */

/**
 * Extracts raw text tokens from a PDF file using pdf2json with 1-based page numbers.
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

interface PdfTextRun {
  T?: string;
}

interface PdfTextBlock {
  x?: number | string;
  y?: number | string;
  R?: PdfTextRun[];
}

interface PdfPage {
  Texts?: PdfTextBlock[];
}

function parsePdfData(data: unknown): PdfTextToken[] {
  const tokens: PdfTextToken[] = [];
  const pages = (isRecord(data) && Array.isArray(data.Pages) ? data.Pages : []) as PdfPage[];

  pages.forEach((page, pageIndex) => {
    const pageNumber = pageIndex + 1;
    const pageTokens = extractPageTokens(page, pageNumber);
    tokens.push(...pageTokens);
  });

  return tokens;
}

function extractPageTokens(
  page: PdfPage,
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

function extractBlockText(block: PdfTextBlock): string {
  const runs = block.R ?? [];
  return runs.map((run) => safeDecodeText(run.T)).join("");
}

function safeDecodeText(encodedText: string | undefined): string {
  const text = encodedText ?? "";
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * ============================================================================
 * STEP 2: SPATIAL LAYOUT RECONSTRUCTION
 * ============================================================================
 */

/**
 * Groups raw tokens into page-local lines in reading order based on spatial coordinates.
 */
export function reconstructLayout(
  tokens: readonly PdfTextToken[],
  { yTolerance = 0.3 }: LayoutOptions = {},
): ReconstructedLayout {
  validateTolerance(yTolerance);

  const tokensByPage = groupTokensByPage(tokens);
  const allLines: LayoutLine[] = [];

  for (const [pageNumber, pageTokens] of tokensByPage.entries()) {
    const pageLines = reconstructPageLines(pageNumber, pageTokens, yTolerance);
    allLines.push(...pageLines);
  }

  const sortedTokens = allLines.flatMap((line) => line.tokens);

  return {
    lines: allLines,
    tokens: sortedTokens,
  };
}

function validateTolerance(yTolerance: number): void {
  if (!Number.isFinite(yTolerance) || yTolerance < 0) {
    throw new TypeError("yTolerance must be a non-negative number");
  }
}

function groupTokensByPage(
  tokens: readonly PdfTextToken[],
): Map<number, PdfTextToken[]> {
  const pages = new Map<number, PdfTextToken[]>();

  for (const token of tokens) {
    const pageTokens = pages.get(token.page) ?? [];
    pageTokens.push({ ...token });
    pages.set(token.page, pageTokens);
  }

  return pages;
}

function reconstructPageLines(
  pageNumber: number,
  tokens: readonly PdfTextToken[],
  yTolerance: number,
): LayoutLine[] {
  const sortedTokens = [...tokens].sort((a, b) => a.y - b.y || a.x - b.x);
  const rawLines = clusterTokensIntoLines(sortedTokens, pageNumber, yTolerance);
  return sortAndFormatLines(rawLines);
}

function clusterTokensIntoLines(
  sortedTokens: readonly PdfTextToken[],
  pageNumber: number,
  yTolerance: number,
): LayoutLine[] {
  const pageLines: LayoutLine[] = [];

  for (const token of sortedTokens) {
    let line = pageLines.find(
      (candidate) => Math.abs(candidate.y - token.y) <= yTolerance,
    );

    if (!line) {
      line = { page: pageNumber, y: token.y, text: "", tokens: [] };
      pageLines.push(line);
    }

    line.tokens.push(token);
    line.y =
      line.tokens.reduce((sum, item) => sum + item.y, 0) / line.tokens.length;
  }

  return pageLines;
}

function sortAndFormatLines(pageLines: readonly LayoutLine[]): LayoutLine[] {
  const sortedLines = [...pageLines].sort((a, b) => a.y - b.y);

  return sortedLines.map((line) => {
    const sortedTokens = [...line.tokens].sort((a, b) => a.x - b.x);

    return {
      ...line,
      tokens: sortedTokens,
      text: sortedTokens.map((token) => token.text).join(" "),
    };
  });
}
