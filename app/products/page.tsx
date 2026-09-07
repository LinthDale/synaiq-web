import type { Metadata } from "next";
import SubpageShell from "../_components/SubpageShell";
import source from "@/content/pages/products.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const content = parsePageMarkdown(source);
const products = content.table("products");
export const metadata: Metadata = { title: content.text("metadata.title"), description: content.text("metadata.description") };

export default function ProductsPage() {
  return <SubpageShell title={content.text("hero.title")} description={content.text("hero.description")} action={{ href: "/contact", label: content.text("action.label"), eyebrow: null }} pageClassName="products-page"><section className="subpage-section" aria-label="SynaiQ 產品分類"><nav className="product-page-grid" aria-label="選擇產品">{products.map((product) => <a className="product-page-card" href={product.href} key={product.title}><h2><MarkdownText text={product.title} /></h2><p><MarkdownText text={product.description} /></p><span className="product-card-action">{content.text("product.action")} <span aria-hidden="true">→</span></span></a>)}</nav></section></SubpageShell>;
}
