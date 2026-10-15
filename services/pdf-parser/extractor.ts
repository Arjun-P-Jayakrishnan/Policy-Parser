import PDFParser, { Output } from "pdf2json";
import type {
  LayoutOptions,
  PdfTextToken,
  PositionedLine,
  PositionedPage,
  PositionedText,
  ReconstructedLayout,
} from "./types.js";

/**
 * Extracts PDF text and reconstructs it into a page → y → x layout.
 */
export async function extractAndReconstructPdf(
  pdfPath: string,
  options: LayoutOptions = {},
): Promise<ReconstructedLayout> {
  // Get the Raw Tokens with Layout information
  const tokens = await extractPdfText(pdfPath);

  // Classify and Reconstruct token layer
  return reconstructLayout(tokens, options);
}

/**
 * Extracts raw text fragments with page numbers and spatial coordinates.
 */
export function extractPdfText(pdfPath: string): Promise<PdfTextToken[]> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (error) => {
      reject(error instanceof Error ? error : error.parserError);
    });

    parser.on("pdfParser_dataReady", (data: Output) => {
      try {
        resolve(parsePdfData(data));
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
 * Groups extracted fragments by page and vertical position,
 * then sorts pages, lines, and fragments into reading order.
 */
export function reconstructLayout(
  tokens: readonly PdfTextToken[],
  { yTolerance = 0.3 }: LayoutOptions = {},
): ReconstructedLayout {
  validateTolerance(yTolerance);

  const pages = groupTokensByPage(tokens).map(
    ([page, pageTokens]): PositionedPage => ({
      page,
      y: reconstructPageLines(pageTokens, yTolerance),
    }),
  );

  return { pages };
}

/**
 * Converts pdf2json page data into library-independent text fragments.
 */
function parsePdfData(data: Output): PdfTextToken[] {
  const tokens: PdfTextToken[] = [];
  const pages = getPdfPages(data);

  pages.forEach((page, index) => {
    tokens.push(...extractPageTokens(page, index + 1));
  });

  return tokens;
}

/**
 * Returns the pages contained in the parsed PDF data.
 */
function getPdfPages(data: Output): PdfPage[] {
  if (!isRecord(data) || !Array.isArray(data.Pages)) {
    return [];
  }

  return data.Pages.filter(isPdfPage);
}

/**
 * Extracts positioned text fragments from a single page.
 */
function extractPageTokens(page: PdfPage, pageNumber: number): PdfTextToken[] {
  const tokens: PdfTextToken[] = [];

  for (const block of page.Texts ?? []) {
    const text = extractBlockText(block);

    if (!text.trim()) continue;

    const x = Number(block.x);
    const y = Number(block.y);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    tokens.push({
      page: pageNumber,
      x,
      y,
      text,
    });
  }

  return tokens;
}

/**
 * Combines and decodes the text runs belonging to one PDF block.
 */
function extractBlockText(block: PdfTextBlock): string {
  return (block.R ?? []).map((run) => decodeText(run.T)).join("");
}

/**
 * Decodes URI-encoded text without failing on malformed input.
 */
function decodeText(text: string | undefined): string {
  try {
    return decodeURIComponent(text ?? "");
  } catch {
    return text ?? "";
  }
}

/**
 * Groups text fragments by page in ascending page-number order.
 */
function groupTokensByPage(
  tokens: readonly PdfTextToken[],
): [number, PdfTextToken[]][] {
  const pages = new Map<number, PdfTextToken[]>();

  for (const token of tokens) {
    const pageTokens = pages.get(token.page) ?? [];
    pageTokens.push(token);
    pages.set(token.page, pageTokens);
  }

  return [...pages.entries()].sort(([a], [b]) => a - b);
}

/**
 * Reconstructs the lines of a page and sorts their text fragments by x.
 */
function reconstructPageLines(
  tokens: readonly PdfTextToken[],
  yTolerance: number,
): PositionedLine[] {
  const sortedTokens = [...tokens].sort((a, b) => a.y - b.y || a.x - b.x);

  const lines = groupTokensByY(sortedTokens, yTolerance);

  return lines
    .map(
      (line): PositionedLine => ({
        y: line.y,
        x: sortTokensByX(line.tokens),
      }),
    )
    .sort((a, b) => a.y - b.y);
}

/**
 * Groups vertically aligned fragments using their average y position.
 */
function groupTokensByY(
  tokens: readonly PdfTextToken[],
  yTolerance: number,
): { y: number; tokens: PdfTextToken[] }[] {
  const lines: { y: number; tokens: PdfTextToken[] }[] = [];

  for (const token of tokens) {
    const line = lines.find(
      (candidate) => Math.abs(candidate.y - token.y) <= yTolerance,
    );

    if (line) {
      line.tokens.push(token);
      line.y = averageY(line.tokens);
      continue;
    }

    lines.push({
      y: token.y,
      tokens: [token],
    });
  }

  return lines;
}

/**
 * Calculates the average vertical position of a line's fragments.
 */
function averageY(tokens: readonly PdfTextToken[]): number {
  return tokens.reduce((sum, token) => sum + token.y, 0) / tokens.length;
}

/**
 * Converts text fragments into x/text pairs sorted from left to right.
 */
function sortTokensByX(tokens: readonly PdfTextToken[]): PositionedText[] {
  return [...tokens]
    .sort((a, b) => a.x - b.x)
    .map(({ x, text }) => ({ x, text }));
}

/**
 * Rejects invalid vertical grouping tolerances.
 */
function validateTolerance(yTolerance: number): void {
  if (!Number.isFinite(yTolerance) || yTolerance < 0) {
    throw new TypeError("yTolerance must be a non-negative number");
  }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPdfPage(value: unknown): value is PdfPage {
  return isRecord(value);
}
