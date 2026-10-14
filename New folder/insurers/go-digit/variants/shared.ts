import type { LayoutLine } from "../../../services/pdf-parser/types.js";
export interface FieldRule<K extends string = string> {
  field: K;
  label: RegExp;
}

/** Applies one variant's explicit field rules to its reconstructed document lines. */
export function extractVariantFields<K extends string>(
  lines: readonly LayoutLine[],
  rules: readonly FieldRule<K>[],
): Partial<Record<K, string>> {
  const fields: Partial<Record<K, string>> = {};
  for (const rule of rules) {
    const value = findValue(lines, rules, rule);
    if (value) fields[rule.field] = value;
  }
  return fields;
}

function findValue(lines: readonly LayoutLine[], rules: readonly FieldRule[], rule: FieldRule): string {
  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i]!.text;
    const match = rule.label.exec(text);
    if (!match) continue;
    const sameLine = cleanValue(rule.field, text.slice(match.index + match[0].length), rules);
    if (sameLine) return sameLine;
    for (let j = i + 1; j < Math.min(lines.length, i + 4); j += 1) {
      const next = lines[j]!.text.trim();
      if (!next || hasLabel(next, rules)) break;
      const value = cleanValue(rule.field, next, rules);
      if (value) return value;
    }
  }
  return "";
}

function cleanValue(field: string, text: string, rules: readonly FieldRule[]): string {
  let end = text.length;
  for (const rule of rules) {
    const match = rule.label.exec(text);
    if (match && match.index > 0) end = Math.min(end, match.index);
  }
  let value = text.slice(0, end).replace(/^[\s:|]+|[\s|]+$/g, "").trim();
  if (field === "vehicleModel") {
    const typeEnd = /\bType\)\s*/i.exec(value);
    if (typeEnd) value = value.slice(typeEnd.index + typeEnd[0].length).trim();
    else value = value.replace(/^(?:Variant\s*)?\(?Sub-?\s*/i, "").trim();
    value = value.replace(/^Type\)\s*/i, "").trim();
  }
  return /^[:\-\s]*$/.test(value) ? "" : value;
}

function hasLabel(text: string, rules: readonly FieldRule[]): boolean {
  return rules.some((rule) => rule.label.test(text));
}
