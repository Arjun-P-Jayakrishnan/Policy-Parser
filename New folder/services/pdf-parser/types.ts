/** Represents a text fragment and its horizontal position. */
export interface PositionedText {
  x: number;
  text: string;
}

/** Represents text fragments sharing an approximately equal vertical position. */
export interface PositionedLine {
  y: number;
  x: PositionedText[];
}

/** Represents the reconstructed text layout of a single PDF page. */
export interface PositionedPage {
  page: number;
  y: PositionedLine[];
}

/** Represents the reconstructed layout of an entire PDF document. */
export interface ReconstructedLayout {
  pages: PositionedPage[];
}

/** Options for grouping text fragments into lines. */
export interface LayoutOptions {
  yTolerance?: number;
}

/** Represents a raw text fragment extracted from a PDF. */
export interface PdfTextToken {
  page: number;
  x: number;
  y: number;
  text: string;
}
