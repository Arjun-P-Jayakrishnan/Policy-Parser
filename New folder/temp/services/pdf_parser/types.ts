/** Library-independent text token; coordinates use pdf2json page-relative units. */
export interface PdfTextToken {
  page: number;
  x: number;
  y: number;
  text: string;
}

export interface LayoutLine {
  page: number;
  y: number;
  text: string;
  tokens: PdfTextToken[];
}

export interface ReconstructedLayout {
  lines: LayoutLine[];
  tokens: PdfTextToken[];
}

export interface LayoutOptions {
  yTolerance?: number;
}
