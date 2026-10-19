import { PdfTextToken } from "../pdf-parser/types.js";

export interface BlueprintEntry<T extends object> {
  field: keyof T;
  locateAndExtract: (tokens: readonly PdfTextToken[]) => string;
}
