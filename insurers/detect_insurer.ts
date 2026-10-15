import type { PdfTextToken } from "../services/pdf-parser/types.js";

//Add others later
export type Insurer = "go-digit";

/**
 * @description Runs a check and Identifies teh insurer
 * @returns Insurer
 */
export function detectInsurer(
  tokens: readonly PdfTextToken[],
): Insurer | undefined {
  const text = tokens.map((token) => token.text).join(" ");
  return /Go Digit General Insurance/i.test(text) ? "go-digit" : undefined;
}
