import { projectProductCatalogue } from "@product-compare/catalog/relational";
import { carCatalogue } from "./catalog.ts";

export const relationalCatalogue = projectProductCatalogue(carCatalogue);
