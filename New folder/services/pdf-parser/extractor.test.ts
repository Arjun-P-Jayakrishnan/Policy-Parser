import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { extractAndReconstructPdf, reconstructLayout } from "./extractor.js";
import type { PdfTextToken } from "./types.js";
import { formatPositionedOutput } from "./positioned-output.js";
import { extractBlueprintFields } from "../../utils/blueprint-utils.js";

test("reconstructLayout groups tokens by page and y tolerance, then sorts x", () => {
  const tokens: PdfTextToken[] = [
    { page: 2, x: 4, y: 8, text: "page-two" },
    { page: 1, x: 8, y: 10.18, text: "world" },
    { page: 1, x: 2, y: 10, text: "hello" },
    { page: 1, x: 1, y: 20, text: "next" },
  ];

  const layout = reconstructLayout(tokens, { yTolerance: 0.3 });
  assert.deepEqual(layout.lines.map((line) => [line.page, line.text]), [
    [2, "page-two"],
    [1, "hello world"],
    [1, "next"],
  ]);
  assert.equal(layout.lines[1]?.tokens[0]?.x, 2);
  assert.equal(layout.lines[1]?.tokens[1]?.x, 8);
});

test("formatPositionedOutput preserves page, y, x, and token text", () => {
  const output = formatPositionedOutput({
    tokens: [],
    lines: [{
      page: 1,
      y: 12.5,
      text: "ignored joined text",
      tokens: [{ page: 1, x: 3, y: 12.5, text: "Policy" }],
    }],
  });
  assert.deepEqual(output, [{
    page: 1,
    y: [{ y: 12.5, x: [{ x: 3, text: "Policy" }] }],
  }]);
});

test("generic blueprint locates boundaries by coordinates and extracts multi-token values", () => {
  const tokens: PdfTextToken[] = [
    { page: 1, x: 2, y: 10, text: "Partner Name:" },
    { page: 1, x: 12, y: 10.1, text: "HEUTE" },
    { page: 1, x: 2, y: 11, text: "Registration Number:" },
  ];
  const result = extractBlueprintFields(
    { pages: new Map([[1, tokens]]) },
    [{ field: "Partner Name:", pages: [1], start: /Partner Name:/, end: /Registration Number:/ }],
  );
  assert.equal(result["Partner Name:"], "HEUTE");
});

test("generic blueprint uses before to select repeated labels and rejects missing boundaries", () => {
  const tokens: PdfTextToken[] = [
    { page: 1, x: 1, y: 1, text: "Name:" },
    { page: 1, x: 8, y: 1, text: "first" },
    { page: 1, x: 1, y: 2, text: "Partner details" },
    { page: 1, x: 1, y: 3, text: "Name:" },
    { page: 1, x: 8, y: 3, text: "second" },
    { page: 1, x: 1, y: 4, text: "End:" },
  ];
  const result = extractBlueprintFields({ pages: new Map([[1, tokens]]) }, [
    { field: "selected", pages: [1], start: /Name:/, end: /End:/, before: /Partner details/ },
    { field: "missing", pages: [1], start: /Name:/, end: /Never present/ },
  ]);
  assert.equal(result.selected, "second");
  assert.equal(result.missing, undefined);
});

test("custom locator and extractor are used for exceptional fields", () => {
  const tokens: PdfTextToken[] = [{ page: 1, x: 1, y: 1, text: "raw" }];
  const result = extractBlueprintFields({ pages: new Map([[1, tokens]]) }, [{
    field: "custom",
    pages: [1],
    locate: (selected) => ({ token: selected[0]!, index: 0, match: /raw/.exec("raw")! }),
    extractValue: () => "custom value",
  }]);
  assert.equal(result.custom, "custom value");
});

test("PDF extraction retains page and positional data in layout tokens", async () => {
  const extracted = await extractAndReconstructPdf(path.resolve("sample.pdf"));
  assert.ok(extracted.tokens.length > 0);
  assert.ok(extracted.lines.length > 0);
  assert.ok(extracted.tokens.every((token) =>
    Number.isInteger(token.page) && Number.isFinite(token.x) && Number.isFinite(token.y) && token.text.length > 0,
  ));
  assert.ok(new Set(extracted.tokens.map((token) => token.page)).size > 1);
});
