/** Represents a single text fragment extracted from a PDF, including its page number and position. */
export interface PdfTextToken {
  /** The page number where the text appears (1-based). */
  page: number;

  /** The horizontal position of the text on the page. */
  x: number;

  /** The vertical position of the text on the page. */
  y: number;

  /** The actual text content extracted from the PDF. */
  text: string;
}

/** Represents a reconstructed line of text containing tokens positioned on the same page and approximately the same vertical level. */
export interface LayoutLine {
  /** The page number where the line appears (1-based). */
  page: number;

  /** The average vertical position of the tokens in the line. */
  y: number;

  /** The combined text of all tokens in the line, ordered from left to right. */
  text: string;

  /** The individual text tokens that make up the line. */
  tokens: PdfTextToken[];
}

/** Contains the reconstructed lines and their individual tokens from a PDF. */
export interface ReconstructedLayout {
  /** All reconstructed text lines, ordered by page and vertical position. */
  lines: LayoutLine[];

  /** All extracted tokens, ordered by their reconstructed line and horizontal position. */
  tokens: PdfTextToken[];
}

/** Configuration options for reconstructing PDF text into lines. */
export interface LayoutOptions {
  /** Maximum vertical distance allowed between tokens to group them into the same line. Defaults to 0.3. */
  yTolerance?: number;
}
