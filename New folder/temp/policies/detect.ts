import type { PdfTextToken } from '../services/pdf_parser/types.js';

export interface PolicyDetection {
  isDigit: boolean;
  isHueteMorgan: boolean;
}

/** Detect supported policy markers among extracted text tokens. */
export function detectPolicyType(tokens: readonly PdfTextToken[] = []): PolicyDetection {
  // PDF extraction may split a visible phrase into multiple text tokens.
  const text = tokens.map((token) => token.text.trim()).filter(Boolean).join(' ').toUpperCase();
  const isDigit = text.includes('GO DIGIT') || text.includes('DIGIT PRIVATE CAR') || text.includes('DIGIT TWO-WHEELER');
  const isHueteMorgan = text.includes('HEUTE AND MORGEN INSURANCE');
  return { isDigit, isHueteMorgan };
}
