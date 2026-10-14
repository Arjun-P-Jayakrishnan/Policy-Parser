import type { LayoutLine } from "../../services/pdf-parser/types.js";
import type { PolicyData } from "../../format/policy.js";
import { normalizeGoDigitPolicy } from "./normalizer.js";
import { parseVariant1 } from "./variants/variant-1/parser.js";

/** Initial supported run: sample.pdf is parsed with Variant 1's source rules. */
export function parseGoDigitVariant1(
  pages: ReadonlyMap<number, readonly LayoutLine[]>,
  fileName = "",
): { parsed: ReturnType<typeof parseVariant1>; normalized: PolicyData } {
  const tokenPages = new Map<number, readonly import("../../services/pdf-parser/types.js").PdfTextToken[]>();
  for (const [page, lines] of pages) tokenPages.set(page, lines.flatMap((line) => line.tokens));
  const parsed = parseVariant1(tokenPages);
  const normalized = normalizeGoDigitPolicy(parsed.fields as import("./variants/variant-1/types.js").Variant1Fields, fileName);
  return { parsed, normalized };
}
