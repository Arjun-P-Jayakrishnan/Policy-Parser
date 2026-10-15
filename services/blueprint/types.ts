import { PositionedPage } from "../pdf-parser/types.js";

export interface BlueprintEntry<T extends object> {
  field: keyof T;
  page: number;
  locateAndExtract: (page: PositionedPage) => string;
}
