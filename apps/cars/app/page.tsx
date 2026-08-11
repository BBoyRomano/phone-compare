import { CataloguePage } from "@product-compare/web";import { carCatalogue } from "../data/catalog";
export default function Home({searchParams}:{readonly searchParams:Promise<Record<string,string|string[]|undefined>>}){return <CataloguePage catalogue={carCatalogue} searchParams={searchParams}/>;}
