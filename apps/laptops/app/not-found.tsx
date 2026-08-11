import type { Metadata } from "next";
export const metadata:Metadata={title:"Page not found — Laptop Compare",robots:{index:false,follow:false}};
export default function NotFound(){return <main className="not-found"><section><p className="eyebrow">404 · Off the comparison map</p><h1>Page not found.</h1><p>Return to the sourced laptop directory and choose two current product families.</p><a href="/">Compare laptops</a></section></main>;}
