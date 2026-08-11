import type { CatalogueBrand,CatalogueProduct,ProductCatalogue } from "@product-compare/catalog";
const assessedAt="2026-08-11";
const officialHosts:Readonly<Record<string,readonly string[]>>={
  toyota:["toyota.com"],ford:["ford.com"],chevrolet:["chevrolet.com"],honda:["honda.com"],hyundai:["hyundaiusa.com"],kia:["kia.com"],tesla:["tesla.com"],
  bmw:["bmwusa.com"],"mercedes-benz":["mbusa.com"],volkswagen:["vw.com"],audi:["audiusa.com"],volvo:["volvocars.com"],subaru:["subaru.com"],mazda:["mazdausa.com"],nissan:["nissanusa.com"]
};
const slugify=(value:string)=>value.toLowerCase().replace(/\+/g," plus ").normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const source=(publisher:string,title:string,url:string)=>({publisher,title,url,accessedAt:assessedAt,market:"United States",role:"lineup" as const});
const products=(brandSlug:string,officialSource:ReturnType<typeof source>,entries:readonly (readonly [string,string])[]):readonly CatalogueProduct[]=>entries.map(([name,segment])=>({
  slug:`${brandSlug}-${slugify(name)}`,
  name,
  segment,
  market:officialSource.market,
  lifecycle:{status:"current",assessedAt},
  evidence:[{source:officialSource,basis:"official-current-lineup",qualification:`Listed in the cited United States manufacturer lineup on ${assessedAt}; model years, trims, and powertrain configurations are not silently merged into facts.`}]
}));
const brand=(slug:string,name:string,officialSource:ReturnType<typeof source>,entries:readonly (readonly [string,string])[]):CatalogueBrand=>({slug,name,officialHosts:officialHosts[slug]??[],lineupSource:officialSource,products:products(slug,officialSource,entries)});

export const carCatalogue:ProductCatalogue={
  id:"cars",title:"Car Compare",singular:"car",plural:"cars",
  description:"Browse current model families from major automakers, compare their official market position, and continue to the manufacturer source before choosing a trim.",
  market:"United States",assessedAt,accent:"#087f5b",
  coverageNote:"Coverage is a family-level snapshot of major United States passenger-vehicle brands. Model years, trims, drivetrains, battery sizes, body variants, fleets, and special editions are not separate records unless the manufacturer's all-vehicles catalogue presents them as distinct named product lines.",
  coverageRule:"Maintain the fifteen cited high-volume and comparison-relevant United States manufacturers, and include only passenger-vehicle lines shown on each cited current manufacturer lineup; additions to the brand set require a first-party candidate review.",
  taxonomyNote:"Segments are editorial navigation labels; model year, trim, body, powertrain, and drivetrain remain configuration dimensions.",
  defaults:["toyota-rav4","tesla-model-y"],
  brands:[
    brand("toyota","Toyota",source("Toyota","Explore all Toyota vehicles","https://www.toyota.com/"),[
      ["Corolla","Sedan"],["Corolla Hatchback","Hatchback"],["Corolla Hybrid","Hybrid sedan"],["Prius","Hybrid hatchback"],["Prius Plug-in Hybrid","Plug-in hybrid hatchback"],["Camry","Hybrid sedan"],["GR86","Sports coupe"],["GR Corolla","Performance hatchback"],["GR Supra","Sports coupe"],["Sienna","Hybrid minivan"],["Toyota Crown","Hybrid sedan"],["Mirai","Fuel-cell sedan"],["Tacoma","Midsize pickup"],["Tundra","Full-size pickup"],["Corolla Cross","Compact SUV"],["Corolla Cross Hybrid","Hybrid compact SUV"],["C-HR","Electric SUV"],["RAV4","Compact SUV"],["RAV4 Plug-in Hybrid","Plug-in hybrid SUV"],["bZ","Electric SUV"],["bZ Woodland","Electric SUV"],["Highlander","Midsize SUV"],["Grand Highlander","Three-row SUV"],["4Runner","Off-road SUV"],["Land Cruiser","Off-road SUV"],["Sequoia","Full-size SUV"],["Crown Signia","Hybrid crossover"]
    ]),
    brand("ford","Ford",source("Ford","Ford new vehicles","https://www.ford.com/new-vehicles/"),[
      ["Mustang","Sports car"],["Mustang Mach-E","Electric SUV"],["Bronco Sport","Compact SUV"],["Bronco","Off-road SUV"],["Escape","Compact SUV"],["Explorer","Three-row SUV"],["Expedition","Full-size SUV"],["Maverick","Compact pickup"],["Ranger","Midsize pickup"],["F-150","Full-size pickup"],["Super Duty","Heavy-duty pickup"],["Transit","Cargo and passenger van"],["E-Transit","Electric van"]
    ]),
    brand("chevrolet","Chevrolet",source("Chevrolet","Chevrolet vehicles","https://www.chevrolet.com/vehicles"),[
      ["Corvette Stingray","Sports car"],["Corvette E-Ray","Electrified sports car"],["Corvette Z06","Performance sports car"],["Trax","Compact SUV"],["Trailblazer","Compact SUV"],["Equinox","Compact SUV"],["Equinox EV","Electric SUV"],["Blazer","Midsize SUV"],["Blazer EV","Electric SUV"],["Traverse","Three-row SUV"],["Tahoe","Full-size SUV"],["Suburban","Extended full-size SUV"],["Colorado","Midsize pickup"],["Silverado 1500","Full-size pickup"],["Silverado HD","Heavy-duty pickup"],["Silverado EV","Electric pickup"]
    ]),
    brand("honda","Honda",source("Honda","Honda vehicles","https://automobiles.honda.com/vehicles"),[
      ["Civic Sedan","Compact sedan"],["Civic Hatchback","Compact hatchback"],["Accord","Midsize sedan"],["Prelude","Hybrid sports coupe"],["HR-V","Compact SUV"],["CR-V","Compact SUV"],["Passport","Midsize SUV"],["Pilot","Three-row SUV"],["Prologue","Electric SUV"],["Odyssey","Minivan"],["Ridgeline","Midsize pickup"]
    ]),
    brand("hyundai","Hyundai",source("Hyundai","Hyundai vehicles","https://www.hyundaiusa.com/us/en/vehicles"),[
      ["Elantra","Compact sedan"],["Elantra N","Performance sedan"],["Sonata","Midsize sedan"],["Venue","Subcompact SUV"],["Kona","Compact SUV"],["Tucson","Compact SUV"],["Santa Fe","Midsize SUV"],["Palisade","Three-row SUV"],["IONIQ 5","Electric SUV"],["IONIQ 5 N","Performance electric SUV"],["IONIQ 6","Electric sedan"],["IONIQ 9","Three-row electric SUV"],["Santa Cruz","Compact pickup"]
    ]),
    brand("kia","Kia",source("Kia","All Kia vehicles","https://www.kia.com/us/en/vehicles"),[
      ["K4","Compact sedan"],["K5","Midsize sedan"],["Soul","Subcompact crossover"],["Seltos","Compact SUV"],["Sportage","Compact SUV"],["Sportage Hybrid","Hybrid compact SUV"],["Sportage Plug-in Hybrid","Plug-in hybrid SUV"],["Sorento","Three-row SUV"],["Sorento Hybrid","Hybrid three-row SUV"],["Sorento Plug-in Hybrid","Plug-in hybrid SUV"],["Telluride","Three-row SUV"],["Telluride Hybrid","Hybrid three-row SUV"],["Carnival MPV","Minivan"],["Carnival MPV Hybrid","Hybrid minivan"],["Niro","Hybrid crossover"],["Niro EV","Electric crossover"],["EV4","Electric sedan"],["EV6","Electric crossover"],["EV9","Three-row electric SUV"]
    ]),
    brand("tesla","Tesla",source("Tesla","Tesla vehicles","https://www.tesla.com/"),[
      ["Model 3","Electric sedan"],["Model Y","Electric SUV"],["Model S","Electric sedan"],["Model X","Electric SUV"],["Cybertruck","Electric pickup"]
    ]),
    brand("bmw","BMW",source("BMW","All BMW models","https://www.bmwusa.com/all-bmws.html"),[
      ["X1","Compact SUV"],["X2","Compact coupe SUV"],["X3","Midsize SUV"],["X5","Midsize SUV"],["X6","Coupe SUV"],["X7","Full-size SUV"],["XM","Performance plug-in hybrid SUV"],["iX3","Electric SUV"],["iX","Electric SUV"],["2 Series","Compact car"],["3 Series","Sport sedan"],["4 Series","Coupe and gran coupe"],["5 Series","Executive sedan"],["7 Series","Luxury sedan"],["M3","Performance sedan"],["M5","Performance sedan and touring"],["i4","Electric gran coupe"],["i5","Electric sedan"],["i7","Electric luxury sedan"],["Z4","Roadster"]
    ]),
    brand("mercedes-benz","Mercedes-Benz",source("Mercedes-Benz","All Mercedes-Benz vehicles","https://www.mbusa.com/en/all-vehicles"),[
      ["CLA Coupe","Compact coupe sedan"],["C-Class Sedan","Luxury sedan"],["E-Class Sedan","Executive sedan"],["S-Class Sedan","Luxury sedan"],["CLE Coupe","Luxury coupe"],["CLE Cabriolet","Luxury convertible"],["SL Roadster","Luxury roadster"],["AMG GT Coupe","Performance coupe"],["GLA SUV","Compact SUV"],["GLB SUV","Compact SUV"],["GLC SUV","Midsize SUV"],["GLC Coupe","Coupe SUV"],["GLE SUV","Midsize SUV"],["GLE Coupe","Coupe SUV"],["GLS SUV","Full-size SUV"],["G-Class SUV","Off-road luxury SUV"],["EQS SUV","Electric luxury SUV"]
    ]),
    brand("volkswagen","Volkswagen",source("Volkswagen","Volkswagen models","https://www.vw.com/en/models.html"),[
      ["Jetta","Compact sedan"],["Jetta GLI","Performance sedan"],["Golf GTI","Performance hatchback"],["Golf R","Performance hatchback"],["Taos","Compact SUV"],["Tiguan","Compact SUV"],["Atlas","Three-row SUV"],["Atlas Cross Sport","Midsize SUV"],["ID.4","Electric SUV"],["ID. Buzz","Electric van"]
    ]),
    brand("audi","Audi",source("Audi","Audi models","https://www.audiusa.com/en/models/"),[
      ["A3","Compact sedan"],["A5","Luxury car"],["A6 e-tron","Electric sedan"],["A7","Luxury car"],["A8","Luxury sedan"],["Q3","Compact SUV"],["Q5","Midsize SUV"],["Q6 e-tron","Electric SUV"],["Q7","Three-row SUV"],["Q8","Luxury SUV"],["Q4 e-tron","Electric SUV"],["e-tron GT","Electric grand tourer"]
    ]),
    brand("volvo","Volvo",source("Volvo","Volvo cars","https://www.volvocars.com/us/cars/"),[
      ["EX30","Compact electric SUV"],["EX40","Electric SUV"],["EC40","Electric crossover"],["EX60","Electric SUV"],["EX90","Three-row electric SUV"],["XC40","Compact SUV"],["XC60","Midsize SUV"],["XC90","Three-row SUV"],["ES90","Electric sedan"],["V60 Cross Country","Wagon"]
    ]),
    brand("subaru","Subaru",source("Subaru","Subaru vehicles","https://www.subaru.com/vehicles/index.html"),[
      ["Impreza","Hatchback"],["BRZ","Sports coupe"],["WRX","Performance sedan"],["Crosstrek","Compact SUV"],["Forester","Compact SUV"],["Outback","Wagon SUV"],["Ascent","Three-row SUV"],["Solterra","Electric SUV"],["Trailseeker","Electric SUV"]
    ]),
    brand("mazda","Mazda",source("Mazda","Mazda vehicles","https://www.mazdausa.com/vehicles"),[
      ["Mazda3 Sedan","Compact sedan"],["Mazda3 Hatchback","Compact hatchback"],["MX-5 Miata","Roadster"],["CX-30","Compact SUV"],["CX-5","Compact SUV"],["CX-50","Compact SUV"],["CX-70","Midsize SUV"],["CX-90","Three-row SUV"]
    ]),
    brand("nissan","Nissan",source("Nissan","Nissan vehicles","https://www.nissanusa.com/vehicles/new.html"),[
      ["Versa","Subcompact sedan"],["Sentra","Compact sedan"],["Altima","Midsize sedan"],["Z","Sports coupe"],["LEAF","Electric hatchback"],["Kicks","Subcompact SUV"],["Rogue","Compact SUV"],["Rogue Plug-in Hybrid","Plug-in hybrid SUV"],["Murano","Midsize SUV"],["Pathfinder","Three-row SUV"],["Armada","Full-size SUV"],["Frontier","Midsize pickup"]
    ])
  ]
};
