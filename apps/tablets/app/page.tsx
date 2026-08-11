import { CataloguePage } from "@product-compare/web";
import { tabletCatalogue } from "../data/catalog";
export default function Home({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CataloguePage catalogue={tabletCatalogue} searchParams={searchParams} />;
}
