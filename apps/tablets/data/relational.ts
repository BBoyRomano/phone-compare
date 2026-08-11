import { projectProductCatalogue } from "@product-compare/catalog/relational";
import { tabletCatalogue } from "./catalog.ts";

export const relationalCatalogue = projectProductCatalogue(tabletCatalogue);
