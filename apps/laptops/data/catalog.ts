import type { CatalogueBrand, CatalogueProduct, ProductCatalogue } from "@product-compare/catalog";
const assessedAt="2026-08-11";
const officialHosts:Readonly<Record<string,readonly string[]>>={
  apple:["apple.com"],dell:["dell.com"],hp:["hp.com"],lenovo:["lenovo.com"],asus:["asus.com"],acer:["acer.com"],microsoft:["microsoft.com"],
  samsung:["samsung.com"],lg:["lg.com"],framework:["frame.work"],razer:["razer.com"],msi:["msi.com"]
};
const slugify=(value:string)=>value.toLowerCase().replace(/\+/g," plus ").normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const source=(publisher:string,title:string,url:string,market="United States")=>({publisher,title,url,accessedAt:assessedAt,market,role:"lineup" as const});
const products=(brandSlug:string,officialSource:ReturnType<typeof source>,entries:readonly (readonly [string,string])[]):readonly CatalogueProduct[]=>entries.map(([name,segment])=>({
  slug:`${brandSlug}-${slugify(name)}`,
  name,
  segment,
  market:officialSource.market,
  lifecycle:{status:"current",assessedAt},
  evidence:[{source:officialSource,basis:"official-current-lineup",qualification:`Listed in the cited ${officialSource.market} manufacturer lineup on ${assessedAt}; processor, memory, storage, display, and channel configurations are not separate identities.`}]
}));
const brand=(slug:string,name:string,officialSource:ReturnType<typeof source>,entries:readonly (readonly [string,string])[]):CatalogueBrand=>({slug,name,officialHosts:officialHosts[slug]??[],lineupSource:officialSource,products:products(slug,officialSource,entries)});

export const laptopCatalogue: ProductCatalogue={
  id:"laptops", title:"Laptop Compare", singular:"laptop", plural:"laptops",
  description:"Explore the current laptop families of major manufacturers, compare their official catalogue position, and continue to first-party product sources.",
  market:"United States", assessedAt, accent:"#c2410c",
  coverageNote:"Coverage is family-level across the major consumer, business, creator, and gaming laptop brands with stable official United States lineup pages. Processor, memory, storage, display, operating-system, and channel configurations are intentionally not expanded into separate products.",
  coverageRule:"Include laptop families shown on the cited official United States lineup for the maintained twelve-brand set; exclude desktops, tablets, accessories, and configuration-only SKUs.",
  taxonomyNote:"Segments are editorial navigation labels; chips, editions, sizes, and configurations remain explicit identity dimensions where the manufacturer distinguishes them.",
  defaults:["apple-macbook-air-13-inch-m5","dell-xps-13"],
  brands:[
    brand("apple","Apple",source("Apple","Mac — compare models","https://www.apple.com/mac/compare/"),[
      ["MacBook Air 13-inch (M5)","Thin-and-light laptop"],["MacBook Air 15-inch (M5)","Thin-and-light laptop"],["MacBook Pro 14-inch (M5)","Pro laptop"],["MacBook Pro 14-inch (M5 Pro)","Pro laptop"],["MacBook Pro 14-inch (M5 Max)","Pro laptop"],["MacBook Pro 16-inch (M5 Pro)","Pro laptop"],["MacBook Pro 16-inch (M5 Max)","Pro laptop"],["MacBook Neo","Everyday laptop"]
    ]),
    brand("dell","Dell",source("Dell","Laptop computers and 2-in-1 PCs","https://www.dell.com/en-us/shop/dell-laptops/sr/all-products/laptops"),[
      ["XPS 13","Premium laptop"],["Dell 14 Plus","Everyday laptop"],["Dell 16 Plus","Everyday laptop"],["Dell 15","Everyday laptop"],["Dell Pro 13","Business laptop"],["Dell Pro 14","Business laptop"],["Dell Pro 16","Business laptop"],["Dell Pro Max 14","Mobile workstation"],["Dell Pro Max 16","Mobile workstation"],["Alienware 16 Area-51","Gaming laptop"]
    ]),
    brand("hp","HP",source("HP","HP laptops","https://www.hp.com/us-en/shop/cat/laptops"),[
      ["OmniBook X","Premium laptop"],["OmniBook Ultra","Premium laptop"],["OmniBook 7","Performance laptop"],["OmniBook 5","Everyday laptop"],["OmniBook 3","Everyday laptop"],["EliteBook Ultra","Business laptop"],["EliteBook 8","Business laptop"],["EliteBook 6","Business laptop"],["ProBook 4","Business laptop"],["ZBook","Mobile workstation"],["OMEN Max","Gaming laptop"],["OMEN 16","Gaming laptop"],["Victus","Gaming laptop"],["HP Chromebook","Chromebook"]
    ]),
    brand("lenovo","Lenovo",source("Lenovo","Lenovo laptops","https://www.lenovo.com/us/en/laptops/"),[
      ["ThinkPad X1","Premium business laptop"],["ThinkPad X Series","Business laptop"],["ThinkPad T Series","Business laptop"],["ThinkPad L Series","Business laptop"],["ThinkPad E Series","Business laptop"],["ThinkPad P Series","Mobile workstation"],["Yoga","Convertible laptop"],["IdeaPad","Everyday laptop"],["Legion","Gaming laptop"],["LOQ","Gaming laptop"]
    ]),
    brand("asus","ASUS",source("ASUS","ASUS laptops","https://www.asus.com/us/laptops/for-home/all-series/"),[
      ["Zenbook","Premium laptop"],["Vivobook","Everyday laptop"],["ProArt P Series","Creator laptop"],["ExpertBook","Business laptop"],["ROG Zephyrus","Gaming laptop"],["ROG Strix","Gaming laptop"],["TUF Gaming","Gaming laptop"],["ASUS Chromebook","Chromebook"]
    ]),
    brand("acer","Acer",source("Acer","Acer laptops","https://www.acer.com/us-en/laptops"),[
      ["Swift","Thin-and-light laptop"],["Aspire","Everyday laptop"],["TravelMate","Business laptop"],["Predator Helios","Gaming laptop"],["Nitro","Gaming laptop"],["Acer Chromebook Plus","Chromebook"],["Acer Chromebook","Chromebook"]
    ]),
    brand("microsoft","Microsoft",source("Microsoft","Shop Microsoft Surface","https://www.microsoft.com/en-us/store/b/shop-all-microsoft-surface"),[
      ["Surface Laptop 13-inch","Thin-and-light laptop"],["Surface Laptop 13.8-inch (8th Edition)","Premium laptop"],["Surface Laptop 15-inch (8th Edition)","Premium laptop"],["Surface Laptop 13.8-inch (7th Edition)","Earlier current-store laptop"],["Surface Laptop 15-inch (7th Edition)","Earlier current-store laptop"]
    ]),
    brand("samsung","Samsung",source("Samsung","Galaxy Book laptops","https://www.samsung.com/us/computing/galaxy-books/"),[
      ["Galaxy Book Ultra","Premium laptop"],["Galaxy Book Pro","Premium laptop"],["Galaxy Book Edge","Thin-and-light laptop"],["Galaxy Chromebook Plus","Chromebook"]
    ]),
    brand("lg","LG",source("LG","LG laptops","https://www.lg.com/us/laptops"),[
      ["LG gram Pro","Premium laptop"],["LG gram","Thin-and-light laptop"],["LG gram Book","Everyday laptop"],["LG UltraGear Gaming Laptop","Gaming laptop"]
    ]),
    brand("framework","Framework",source("Framework","Framework products","https://frame.work/marketplace/laptops"),[
      ["Framework Laptop 12","Convertible repairable laptop"],["Framework Laptop 13","Repairable laptop"],["Framework Laptop 13 Pro","Performance repairable laptop"],["Framework Laptop 16","Modular performance laptop"]
    ]),
    brand("razer","Razer",source("Razer","Razer Blade laptops","https://www.razer.com/gaming-laptops"),[
      ["Razer Blade 14","Gaming laptop"],["Razer Blade 16","Gaming laptop"],["Razer Blade 18","Gaming laptop"]
    ]),
    brand("msi","MSI",source("MSI","MSI laptops","https://us.msi.com/Laptops/Products"),[
      ["Prestige","Business laptop"],["Summit","Business laptop"],["Stealth","Gaming laptop"],["Raider","Gaming laptop"],["Titan","Gaming laptop"],["Vector","Gaming laptop"],["Katana","Gaming laptop"],["Cyborg","Gaming laptop"],["Modern","Everyday laptop"]
    ])
  ]
};
