import { projectPhoneCatalogue } from "@product-compare/catalog/relational";
import { phones, sources } from "./catalog.ts";

export const relationalCatalogue = projectPhoneCatalogue({ appId: "phones", phones, sources });
