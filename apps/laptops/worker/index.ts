import handler from "vinext/server/app-router-entry";
import { withCatalogueApi } from "@product-compare/catalog/worker";
export default withCatalogueApi(handler, "laptops");
