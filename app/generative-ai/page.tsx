import Image from "next/image";
import type { Metadata } from "next";
import SubpageShell from "../_components/SubpageShell";
import source from "@/content/pages/generative-ai.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const content = parsePageMarkdown(source);
export const metadata: Metadata = { title: content.text("metadata.title"), description: content.text("metadata.description") };

export default function GenerativeAiPage() {
  return <SubpageShell eyebrow={content.text("hero.eyebrow")} title={content.text("hero.title")} description={content.text("hero.description")} pageClassName="evidence-page generative-page" heroVisual={<figure className="subpage-hero-evidence media-frame media-frame-evidence"><div className="subpage-hero-evidence-media"><Image src="/brand/media-factory.png" alt={content.text("hero.image-alt")} fill priority sizes="(max-width: 900px) 100vw, 48vw" /></div><figcaption>{content.text("hero.caption")}</figcaption></figure>} action={{ href: "/contact", label: content.text("action.label"), eyebrow: content.text("action.eyebrow"), title: content.text("action.title"), description: content.text("action.description") }}><section className="subpage-section subpage-two-column"><div><div className="eyebrow">{content.text("services.eyebrow")}</div><h2><MarkdownText text={content.text("services.title")} /></h2></div><ul className="subpage-list">{content.lines("services.items").map((item) => <li key={item}>{item}</li>)}</ul></section><section className="subpage-section"><div className="eyebrow">{content.text("flow.eyebrow")}</div><h2><MarkdownText text={content.text("flow.title")} /></h2><ol className="subpage-list ordered">{content.lines("flow.steps").map((step) => <li key={step}>{step}</li>)}</ol></section></SubpageShell>;
}
