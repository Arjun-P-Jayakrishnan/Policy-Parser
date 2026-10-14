# Policy Parser

TypeScript project for PDF text extraction and layout inspection, with typed policy data and a CSV exporter.

## Install and run

Requires Node.js 20.18 or later. Install dependencies with `npm install`, then run `npm start` or `npm run dev`. Run `npm run typecheck` to validate types or `npm run build` to emit JavaScript and declarations to `dist/`. The application processes the root-level `sample.pdf`. `log.txt` contains page-by-page extracted lines and token positions; `output.txt` contains the parsed policy fields grouped by source page, followed by the final policy JSON.

## PDF tokens and layout

`extractPdfText(pdfPath: string)` from `services/pdf_parser/extract.ts` returns `Promise<PdfTextToken[]>`, where `PdfTextToken` is `{ page: number, x: number, y: number, text: string }`. Pages are 1-based. Coordinates come from **pdf2json** (a Node PDF.js-based parser) and use its page-relative coordinate scale with a top-left origin, so y increases downward. The values are not PDF points; compare them within a document. The extraction module maps library output into this independent shape and propagates parse and file errors.

`reconstructLayout(tokens: readonly PdfTextToken[], options?: LayoutOptions)` groups nearby tokens into `LayoutLine` values and returns a `ReconstructedLayout` (`{ lines, tokens }`). Lines are ordered page by page and top to bottom; tokens within each line are left to right. Tolerance uses pdf2json coordinate units and can be configured for different documents.

## Policy model and CSV export

`createPolicy(): PolicyData` from `format/policy.ts` returns all 36 documented policy fields initialized to empty strings, with `Status: false`. `Date`, `RiskStartDate`, and `RenewalDate` are strings (dates should be `YYYY-MM-DD`).

`exportPoliciesToCsv(policies: readonly Partial<PolicyData>[], filePath: string): Promise<void>` from `services/csv/convert.ts` writes the fixed 36-column header even for an empty array, maps missing values to blank cells, and escapes standard CSV special characters. It creates the destination directory recursively and rejects on filesystem errors. Example:

```js
import { createPolicy } from './format/policy.js';
import { exportPoliciesToCsv } from './services/csv/convert.js';

const policy = createPolicy();
await exportPoliciesToCsv([policy], './output/policies.csv');
```

## Modules

- `policies/detect.ts` detects supported policy document markers across token boundaries.
- `policies/digit.ts` parses the currently implemented Go Digit fields. The CSV contains recognized policies; fields without matching extraction rules remain blank.
- `output/` is for generated files; `pdfs/` contains input documents and is not ignored by Git.

## TypeScript layout

Application source is TypeScript. Shared PDF and layout interfaces live in `services/pdf_parser/types.ts`; the complete `PolicyData` interface lives beside its factory in `format/policy.ts`. Imports use `.js` suffixes so the emitted Node ESM files resolve correctly after compilation.

```text
index.ts
format/policy.ts
policies/detect.ts
policies/digit.ts
services/csv/convert.ts
services/pdf_parser/extract.ts
services/pdf_parser/layout.ts
services/pdf_parser/types.ts
tsconfig.json
```
