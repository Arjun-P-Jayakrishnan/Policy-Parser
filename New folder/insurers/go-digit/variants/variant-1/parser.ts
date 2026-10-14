import type { PdfTextToken } from "../../../../services/pdf-parser/types.js";
import { extractBlueprintFields } from "../../../../utils/blueprint-utils.js";
import { VARIANT_1_BLUEPRINT } from "./blueprint.js";
import type { Variant1ParseResult } from "./types.js";

/** Extracts the raw fields supported by the initial sample.pdf layout. */
export function parseVariant1(
  pages: ReadonlyMap<number, readonly PdfTextToken[]>,
): Variant1ParseResult {
  const fields = extractBlueprintFields({ pages }, VARIANT_1_BLUEPRINT);
  return { variant: "variant-1", fields };
}
