import type { PdfTextToken } from "../services/pdf-parser/types.js";

export type Insurer = "go-digit";

export function detectInsurer(tokens: readonly PdfTextToken[]): Insurer | undefined {
  const text = tokens.map((token) => token.text).join(" ");
  return /Go Digit General Insurance/i.test(text) ? "go-digit" : undefined;
}
