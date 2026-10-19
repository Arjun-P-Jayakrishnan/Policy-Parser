import type { BlueprintEntry } from "../../../services/blueprint/types.js";
import type { Variant2Data } from "./types.js";

/** Defines the PDF labels and extraction rules for Variant 2. */
export const blueprint: BlueprintEntry<Variant2Data>[] = [
  { field: "LOB", locateAndExtract: () => "TW" },
];
