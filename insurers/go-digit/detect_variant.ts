import { PdfTextToken } from "../../services/pdf-parser/types.js";

export type GoDigitLayoutVariant = "variant-1" | "variant-2" | "variant-3";

export function detectGoDigitLayout(
  pages: ReadonlyMap<number, readonly PdfTextToken[]>,
): GoDigitLayoutVariant | undefined {
  const text = [...pages.values()]
    .flat()
    .map((line) => line.text)
    .join(" ");
  if (/Digit Private Car Policy/i.test(text)) return "variant-1";
  if (/Digit Two-Wheeler Insurance/i.test(text)) return "variant-2";
  if (/Digit Commercial Vehicle Insurance/i.test(text)) return "variant-3";
  return undefined;
}
