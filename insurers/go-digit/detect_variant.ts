import { PdfTextToken } from "../../services/pdf-parser/types.js";

export type GoDigitLayoutVariant = "variant-1";

export function detectGoDigitLayout(
  pages: ReadonlyMap<number, readonly PdfTextToken[]>,
): GoDigitLayoutVariant | undefined {
  const text = [...pages.values()]
    .flat()
    .map((line) => line.text)
    .join(" ");
  return /Digit Private Car Policy/i.test(text) ? "variant-1" : undefined;
}
