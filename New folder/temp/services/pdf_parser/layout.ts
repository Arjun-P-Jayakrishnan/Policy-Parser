import type {
  LayoutLine,
  LayoutOptions,
  PdfTextToken,
  ReconstructedLayout,
} from "./types.js";

/**
 * Groups raw PDF tokens into page-local lines in logical reading order.
 * Acts as the main orchestrator, delegating tasks to pure helper functions.
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

/**
 * Validates the vertical tolerance option. Throws if invalid.
 */
function validateTolerance(yTolerance: number): void {
  if (!Number.isFinite(yTolerance) || yTolerance < 0) {
    throw new TypeError("yTolerance must be a non-negative number");
  }
}

/**
 * Groups an array of tokens by their page numbers.
 * Pure: Returns a new Map containing freshly cloned token objects.
 */
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

/**
 * Reconstructs, clusters, and formats lines for a single page.
 * Pure: Does not mutate the input token array.
 */
function reconstructPageLines(
  pageNumber: number,
  tokens: readonly PdfTextToken[],
  yTolerance: number,
): LayoutLine[] {
  // Sort tokens initially by vertical (y) then horizontal (x) position
  const sortedTokens = [...tokens].sort((a, b) => a.y - b.y || a.x - b.x);

  const rawLines = clusterTokensIntoLines(sortedTokens, pageNumber, yTolerance);
  return sortAndFormatLines(rawLines);
}

/**
 * Clusters a sorted list of tokens into distinct lines based on vertical tolerance.
 * Pure: Builds and returns a new array of line objects.
 */
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
    // Recalculate average y-coordinate for the line dynamically
    line.y =
      line.tokens.reduce((sum, item) => sum + item.y, 0) / line.tokens.length;
  }

  return pageLines;
}

/**
 * Sorts lines vertically, sorts tokens within each line horizontally, and builds line text.
 * Pure: Uses array copying (`[...arr]`) to avoid mutating inputs.
 */
function sortAndFormatLines(pageLines: readonly LayoutLine[]): LayoutLine[] {
  // Sort lines top-to-bottom
  const sortedLines = [...pageLines].sort((a, b) => a.y - b.y);

  return sortedLines.map((line) => {
    // Sort tokens left-to-right within the line
    const sortedTokens = [...line.tokens].sort((a, b) => a.x - b.x);

    return {
      ...line,
      tokens: sortedTokens,
      text: sortedTokens.map((token) => token.text).join(" "),
    };
  });
}
