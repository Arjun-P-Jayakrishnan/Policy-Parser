import type { PdfTextToken } from "../services/pdf-parser/types.js";

export interface BlueprintContext { pages: ReadonlyMap<number, readonly PdfTextToken[]>; }
export interface TokenMatch { token: PdfTextToken; index: number; match: RegExpExecArray; end?: TokenMatch; }
export interface BlueprintRule {
  field: string;
  pages: readonly number[];
  start?: RegExp;
  end?: RegExp;
  before?: RegExp;
  locate?: (tokens: readonly PdfTextToken[]) => TokenMatch | undefined;
  extractValue?: (tokens: readonly PdfTextToken[], match: TokenMatch) => string;
}

/** Collects tokens from the requested pages in page order. */
export function selectPages(context: BlueprintContext, pages: readonly number[]): PdfTextToken[] {
  return pages.flatMap((page) => context.pages.get(page) ?? []);
}

/** Finds the first token whose text matches the regular expression. */
export function findToken(tokens: readonly PdfTextToken[], regex: RegExp): TokenMatch | undefined {
  for (let index = 0; index < tokens.length; index += 1) {
    regex.lastIndex = 0;
    const match = regex.exec(tokens[index]!.text);
    if (match) return { token: tokens[index]!, index, match };
  }
  return undefined;
}

/** Creates a locator that finds the first token matching a regular expression. */
export function locateByRegex(regex: RegExp): (tokens: readonly PdfTextToken[]) => TokenMatch | undefined {
  return (tokens) => findToken(tokens, regex);
}

/** Locates a start/end pair, optionally requiring a preceding marker. */
export function locateGeneric(tokens: readonly PdfTextToken[], start: RegExp, end: RegExp, before?: RegExp): TokenMatch | undefined {
  for (let index = 0; index < tokens.length; index += 1) {
    start.lastIndex = 0;
    const match = start.exec(tokens[index]!.text);
    if (!match || (before && !tokens.slice(0, index).some((token) => before.test(token.text)))) continue;
    const beginning: TokenMatch = { token: tokens[index]!, index, match };
    const ending = findEndingToken(tokens, beginning, end);
    if (ending) return { ...beginning, end: ending };
  }
  return undefined;
}

function findEndingToken(tokens: readonly PdfTextToken[], start: TokenMatch, end: RegExp, yTolerance = 0.3): TokenMatch | undefined {
  const candidates = tokens.map((token, index) => {
    end.lastIndex = 0;
    const match = end.exec(token.text);
    return { token, index, match };
  }).filter(({ index, match }) => Boolean(match) && (index > start.index || (index === start.index && (match?.index ?? -1) > start.match.index + start.match[0].length)));
  const sameLine = candidates.find(({ token }) => Math.abs(token.y - start.token.y) <= yTolerance);
  const nextLine = candidates.find(({ token }) => token.y > start.token.y + yTolerance);
  const candidate = sameLine ?? nextLine;
  return candidate ? { token: candidate.token, index: candidate.index, match: candidate.match! } : undefined;
}

/** Extracts the text between a matched start token and its end token. */
export function extractBetweenTokens(tokens: readonly PdfTextToken[], match: TokenMatch): string {
  if (!match.end) return "";
  const values: string[] = [];
  const inline = match.token.text.slice(match.match.index + match.match[0].length, match.end.index === match.index ? match.end.match.index : undefined);
  if (inline) values.push(inline);
  if (match.end.index !== match.index) {
    for (let index = match.index + 1; index < match.end.index; index += 1) values.push(tokens[index]!.text);
    const beforeEnd = match.end.token.text.slice(0, match.end.match.index);
    if (beforeEnd) values.push(beforeEnd);
  }
  return values.join(" ");
}

/** Applies blueprint rules and returns the extracted field values. */
export function extractBlueprintFields(context: BlueprintContext, blueprint: readonly BlueprintRule[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const rule of blueprint) {
    const tokens = selectPages(context, rule.pages);
    const match = rule.locate ? rule.locate(tokens) : rule.start && rule.end ? locateGeneric(tokens, rule.start, rule.end, rule.before) : undefined;
    if (!match) continue;
    fields[rule.field] = rule.extractValue ? rule.extractValue(tokens, match) : extractBetweenTokens(tokens, match);
  }
  return fields;
}
