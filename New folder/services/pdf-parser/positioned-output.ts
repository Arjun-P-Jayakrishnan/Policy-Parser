import type { LayoutLine, ReconstructedLayout } from "./types.js";

export interface PositionedToken {
  x: number;
  text: string;
}

export interface PositionedYLine {
  y: number;
  x: PositionedToken[];
}

export interface PositionedPage {
  page: number;
  y: PositionedYLine[];
}

/** Converts reconstructed extractor lines into page → y → x/text output. */
export function formatPositionedOutput(
  layout: ReconstructedLayout,
): PositionedPage[] {
  const pages = new Map<number, LayoutLine[]>();
  for (const line of layout.lines) {
    const pageLines = pages.get(line.page) ?? [];
    pageLines.push(line);
    pages.set(line.page, pageLines);
  }

  return [...pages].map(([page, lines]) => ({
    page,
    y: lines.map((line) => ({
      y: line.y,
      x: line.tokens.map((token) => ({
        x: token.x,
        text: token.text,
      })),
    })),
  }));
}
