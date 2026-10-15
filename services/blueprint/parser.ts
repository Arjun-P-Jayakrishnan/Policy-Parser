import { ReconstructedLayout } from "../pdf-parser/types.js";
import { BlueprintEntry } from "./types.js";

export function parseDocument<T extends { [K in keyof T]: string }>(
  layout: ReconstructedLayout,
  blueprint: BlueprintEntry<T>[],
): T {
  const result: Record<keyof T, string> = {} as Record<keyof T, string>;

  for (const rule of blueprint) {
    const page = layout.pages.find((page) => page.page === rule.page);

    result[rule.field] = page ? rule.locateAndExtract(page) : "";
  }

  return result as T;
}
