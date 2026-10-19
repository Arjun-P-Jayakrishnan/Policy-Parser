import { PdfTextToken, ReconstructedLayout } from "../pdf-parser/types.js";
import { BlueprintEntry } from "./types.js";

export function parseDocument<T extends { [K in keyof T]: string }>(
  layout: ReconstructedLayout,
  blueprint: BlueprintEntry<T>[],
): T {
  const result: Record<keyof T, string> = {} as Record<keyof T, string>;
  const tokens: PdfTextToken[] = layout.pages.flatMap((page) =>
    page.y.flatMap((line) =>
      line.x.map(({ x, text }) => ({ page: page.page, x, y: line.y, text })),
    ),
  );

  for (const rule of blueprint) {
    result[rule.field] = rule.locateAndExtract(tokens);
  }

  return result as T;
}
