import type {
  PositionedPage,
  PositionedText,
  ReconstructedLayout,
} from "../services/pdf-parser/types.js";

export interface RawDataMatch {
  page: number;
  y: number;
  x: number;
  text: string;
  match: RegExpExecArray;
  lineIndex: number;
  textIndex: number;
}

export type ValueFormatter = (value: string) => string;

/**
 * Returns the requested page from the reconstructed PDF layout.
 * Returns undefined when the page does not exist.
 */
export function selectPage(
  layout: ReconstructedLayout,
  pageNumber: number,
): PositionedPage | undefined {
  return layout.pages.find((page) => page.page === pageNumber);
}

/**
 * Finds fragments matching the label regex on the requested page.
 * For each candidate, optionally checks whether nextToken appears
 * in the remaining text, subsequent fragments on the same line,
 * or fragments on the immediately following line.
 * Whitespace-only fragments are ignored during boundary matching.
 * Without nextToken, returns only the first label match.
 */
export function getRawData(
  page: PositionedPage,
  label: RegExp,
  nextToken?: RegExp,
): RawDataMatch[] {
  const candidates = findLabelMatches(page, label);

  if (!nextToken) {
    return candidates.slice(0, 1);
  }

  return candidates.filter((candidate) =>
    hasFollowingPattern(page, candidate, nextToken),
  );
}

/**
 * Extracts the value associated with a located label and applies
 * optional formatters in the order supplied.
 * The value is assembled from meaningful fragments after the label,
 * stopping at the matching nextToken when one was specified.
 */
export function extractValue(
  page: PositionedPage,
  matches: readonly RawDataMatch[],
  nextToken?: RegExp,
  ...formatters: ValueFormatter[]
): string {
  const candidate = matches[0];

  if (!candidate) return "";

  let value = collectValue(page, candidate, nextToken);

  for (const formatter of formatters) {
    value = formatter(value);
  }

  return value.trim();
}

/**
 * Finds every fragment containing a label match.
 */
function findLabelMatches(page: PositionedPage, label: RegExp): RawDataMatch[] {
  const matches: RawDataMatch[] = [];

  page.y.forEach((line, lineIndex) => {
    line.x.forEach((fragment, textIndex) => {
      const match = execRegex(label, fragment.text);

      if (!match) return;

      matches.push({
        page: page.page,
        y: line.y,
        x: fragment.x,
        text: fragment.text,
        match,
        lineIndex,
        textIndex,
      });
    });
  });

  return matches;
}

/**
 * Checks the text after a label for the boundary pattern.
 */
function hasFollowingPattern(
  page: PositionedPage,
  candidate: RawDataMatch,
  pattern: RegExp,
): boolean {
  const fragments = getSearchFragments(page, candidate);

  return fragments.some((fragment) => execRegex(pattern, fragment.text));
}

/**
 * Returns the searchable text beginning after the label match.
 * Includes the rest of the current fragment, subsequent fragments
 * on the same line, and fragments on the immediately following line.
 */
function getSearchFragments(
  page: PositionedPage,
  candidate: RawDataMatch,
): PositionedText[] {
  const currentLine = page.y[candidate.lineIndex];

  if (!currentLine) return [];

  const fragments: PositionedText[] = [
    {
      x: candidate.x,
      text: candidate.text.slice(
        candidate.match.index + candidate.match[0].length,
      ),
    },
    ...currentLine.x.slice(candidate.textIndex + 1),
  ];

  const nextLine = page.y[candidate.lineIndex + 1];

  if (nextLine) {
    fragments.push(...nextLine.x);
  }

  return fragments.filter((fragment) => fragment.text.trim().length > 0);
}

/**
 * Collects the value following the label until the boundary is found.
 */
function collectValue(
  page: PositionedPage,
  candidate: RawDataMatch,
  nextToken?: RegExp,
): string {
  const fragments = getSearchFragments(page, candidate);
  const values: string[] = [];

  for (const fragment of fragments) {
    const text = fragment.text.trim();

    if (!text) continue;

    const boundary = nextToken ? execRegex(nextToken, text) : null;

    if (boundary) {
      const beforeBoundary = text.slice(0, boundary.index).trim();

      if (beforeBoundary) values.push(beforeBoundary);

      break;
    }

    values.push(text);
  }

  return values.join(" ").trim();
}

/**
 * Executes a regex from the beginning of a string without leaking
 * state from global or sticky regular expressions.
 */
function execRegex(regex: RegExp, text: string): RegExpExecArray | null {
  regex.lastIndex = 0;
  return regex.exec(text);
}
