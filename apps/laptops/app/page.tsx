import { CataloguePage } from "@product-compare/web";
import { laptopCatalogue } from "../data/catalog";
export default function Home({searchParams}:{readonly searchParams:Promise<Record<string,string|string[]|undefined>>}){return <CataloguePage catalogue={laptopCatalogue} searchParams={searchParams}/>;}
