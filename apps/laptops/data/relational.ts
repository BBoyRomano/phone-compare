import { projectProductCatalogue } from "@product-compare/catalog/relational";
import { laptopCatalogue } from "./catalog.ts";

export const relationalCatalogue = projectProductCatalogue(laptopCatalogue);
