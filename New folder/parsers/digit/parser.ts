import type { PolicyData } from "../../format/policy.js";
import { createPolicy } from "../../format/policy.js";
import { LayoutLine } from "../../services/pdf-parser/types.js";
import { GoDigitBlueprints, type BlueprintStep } from "./blueprint.js";

/** Orchestrates parsing Go Digit policies page-by-page using sequential blueprints. */
export function parseDigitPolicyFromLayout(
  pages: Map<number, readonly LayoutLine[]>,
  fileName = "",
): PolicyData {
  const policy = createPolicy();
  policy.Filename = fileName;
  policy.InsuranceCompany = "Go Digit";

  for (const extractedFields of parseDigitPolicyByPage(pages).values()) {
    Object.assign(policy, extractedFields);
  }

  return policy;
}

/** Returns parsed field values grouped by the page where each was extracted. */
export function parseDigitPolicyByPage(
  pages: Map<number, readonly LayoutLine[]>,
): Map<number, Partial<Record<keyof PolicyData, string>>> {
  const result = new Map<number, Partial<Record<keyof PolicyData, string>>>();
  for (const [pageNumber, lines] of pages.entries()) {
    const blueprint = GoDigitBlueprints[pageNumber];
    if (!blueprint) continue;

    const extractedFields = executeBlueprintSequence(lines, blueprint);
    result.set(pageNumber, extractedFields);
  }
  return result;
}

/** Iterates sequentially through layout lines, validating flow and extracting target fields. */
function executeBlueprintSequence(
  lines: readonly LayoutLine[],
  blueprint: readonly BlueprintStep[],
): Partial<Record<keyof PolicyData, string>> {
  const result: Partial<Record<keyof PolicyData, string>> = {};
  let lineIndex = 0;

  for (const step of blueprint) {
    while (lineIndex < lines.length) {
      const currentLine = lines[lineIndex]!;

      if (currentLine.text.includes(step.anchor)) {
        if (step.extract) {
          const value = step.multiLine
            ? collectMultiLineValue(lines, lineIndex, step.anchor, blueprint)
            : extractSingleLineValue(currentLine.text, step.anchor);

          if (value && step.field !== "IGNORE") {
            result[step.field as keyof PolicyData] = cleanValue(value);
          }
        }

        lineIndex++;
        break;
      }
      lineIndex++;
    }
  }

  return result;
}

/** Extracts value on the same line after the anchor text. */
function extractSingleLineValue(lineText: string, anchor: string): string {
  return lineText.replace(anchor, "").trim();
}

/** Collects text across multiple lines until hitting the next known blueprint anchor boundary. */
function collectMultiLineValue(
  lines: readonly LayoutLine[],
  startIndex: number,
  anchor: string,
  blueprint: readonly BlueprintStep[],
): string {
  const parts: string[] = [];
  const startLine = lines[startIndex]!;
  const initial = startLine.text.replace(anchor, "").trim();
  if (initial) parts.push(initial);

  const allAnchors = blueprint.map((b) => b.anchor);

  for (let i = startIndex + 1; i < lines.length; i++) {
    const nextLine = lines[i]!;
    const hitBoundary = allAnchors.some((a) => nextLine.text.includes(a));

    if (hitBoundary || !nextLine.text.trim()) {
      break;
    }
    parts.push(nextLine.text.trim());
  }

  return parts.join(" ");
}

/** Cleans up trailing colons, dashes, or unwanted spacing artifacts. */
function cleanValue(text: string): string {
  return text.replace(/^[:\-]\s*/, "").trim();
}
