import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { extractBlueprintFields } from "../../utils/blueprint-utils.js";
import { extractAndReconstructPdf, reconstructLayout } from "./extractor.js";
import type { PdfTextToken } from "./types.js";

test("reconstructLayout groups tokens by page and y tolerance, then sorts x", () => {
  const tokens: PdfTextToken[] = [
    { page: 2, x: 4, y: 8, text: "page-two" },
    { page: 1, x: 8, y: 10.18, text: "world" },
    { page: 1, x: 2, y: 10, text: "hello" },
    { page: 1, x: 1, y: 20, text: "next" },
  ];

  const layout = reconstructLayout(tokens, { yTolerance: 0.3 });

  assert.deepEqual(layout.pages, [
    {
      page: 1,
      y: [
        {
          y: 10.09,
          x: [
            { x: 2, text: "hello" },
            { x: 8, text: "world" },
          ],
        },
        {
          y: 20,
          x: [{ x: 1, text: "next" }],
        },
      ],
    },
    {
      page: 2,
      y: [
        {
          y: 8,
          x: [{ x: 4, text: "page-two" }],
        },
      ],
    },
  ]);
});

test("reconstructLayout returns empty pages array for empty input", () => {
  assert.deepEqual(reconstructLayout([]), { pages: [] });
});

test("reconstructLayout keeps fragments on separate lines outside y tolerance", () => {
  const tokens: PdfTextToken[] = [
    { page: 1, x: 2, y: 10, text: "first" },
    { page: 1, x: 8, y: 10.5, text: "second" },
  ];

  const layout = reconstructLayout(tokens, { yTolerance: 0.3 });

  assert.deepEqual(layout.pages, [
    {
      page: 1,
      y: [
        { y: 10, x: [{ x: 2, text: "first" }] },
        { y: 10.5, x: [{ x: 8, text: "second" }] },
      ],
    },
  ]);
});

test("reconstructLayout rejects invalid y tolerance", () => {
  assert.throws(() => reconstructLayout([], { yTolerance: -1 }), {
    name: "TypeError",
    message: "yTolerance must be a non-negative number",
  });

  assert.throws(
    () => reconstructLayout([], { yTolerance: Number.NaN }),
    TypeError,
  );
});

test("generic blueprint locates boundaries by coordinates and extracts multi-token values", () => {
  const tokens: PdfTextToken[] = [
    { page: 1, x: 2, y: 10, text: "Partner Name:" },
    { page: 1, x: 12, y: 10.1, text: "HEUTE" },
    { page: 1, x: 2, y: 11, text: "Registration Number:" },
  ];

  const result = extractBlueprintFields({ pages: new Map([[1, tokens]]) }, [
    {
      field: "Partner Name:",
      pages: [1],
      start: /Partner Name:/,
      end: /Registration Number:/,
    },
  ]);

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
    {
      field: "selected",
      pages: [1],
      start: /Name:/,
      end: /End:/,
      before: /Partner details/,
    },
    {
      field: "missing",
      pages: [1],
      start: /Name:/,
      end: /Never present/,
    },
  ]);

  assert.equal(result.selected, "second");
  assert.equal(result.missing, undefined);
});

test("custom locator and extractor are used for exceptional fields", () => {
  const tokens: PdfTextToken[] = [{ page: 1, x: 1, y: 1, text: "raw" }];

  const result = extractBlueprintFields({ pages: new Map([[1, tokens]]) }, [
    {
      field: "custom",
      pages: [1],
      locate: (selected) => ({
        token: selected[0]!,
        index: 0,
        match: /raw/.exec("raw")!,
      }),
      extractValue: () => "custom value",
    },
  ]);

  assert.equal(result.custom, "custom value");
});

test("PDF extraction retains page and positional data", async () => {
  const extracted = await extractAndReconstructPdf(path.resolve("sample.pdf"));

  assert.ok(extracted.pages.length > 0);

  const pageNumbers = extracted.pages.map((page) => page.page);

  assert.ok(pageNumbers.every(Number.isInteger));
  assert.ok(pageNumbers.every((page) => page >= 1));
  assert.deepEqual(
    pageNumbers,
    [...pageNumbers].sort((a, b) => a - b),
  );

  const lines = extracted.pages.flatMap((page) => page.y);
  const fragments = lines.flatMap((line) => line.x);

  assert.ok(lines.length > 0);
  assert.ok(fragments.length > 0);

  assert.ok(lines.every((line) => Number.isFinite(line.y)));

  assert.ok(
    fragments.every(
      (fragment) => Number.isFinite(fragment.x) && fragment.text.length > 0,
    ),
  );

  assert.ok(new Set(pageNumbers).size > 1);
});
