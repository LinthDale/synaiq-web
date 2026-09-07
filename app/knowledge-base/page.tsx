import Image from "next/image";
import type { Metadata } from "next";
import SubpageShell from "../_components/SubpageShell";
import source from "@/content/pages/knowledge-base.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const content = parsePageMarkdown(source);
const screenshots = content.table("screenshots");
export const metadata: Metadata = { title: content.text("metadata.title"), description: content.text("metadata.description") };

export default function KnowledgeBasePage() {
  return (
    <SubpageShell eyebrow={content.text("hero.eyebrow")} title={content.text("hero.title")} description={content.text("hero.description")} pageClassName="evidence-page knowledge-page" heroVisual={<figure className="subpage-hero-evidence media-frame media-frame-evidence"><div className="subpage-hero-evidence-media"><Image src="/brand/knowledge-base.png" alt={content.text("hero.image-alt")} fill priority sizes="(max-width: 900px) 100vw, 48vw" /></div><figcaption>{content.text("hero.caption")}</figcaption></figure>} action={{ href: "/contact", label: content.text("action.label"), eyebrow: content.text("action.eyebrow"), title: content.text("action.title"), description: content.text("action.description") }}>
      <section className="subpage-section subpage-two-column"><div><div className="eyebrow">{content.text("capabilities.eyebrow")}</div><h2><MarkdownText text={content.text("capabilities.title")} /></h2></div><ul className="subpage-list">{content.lines("capabilities.items").map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="subpage-section"><div className="eyebrow">{content.text("use-cases.eyebrow")}</div><h2><MarkdownText text={content.text("use-cases.title")} /></h2><p className="subpage-wide-copy"><MarkdownText text={content.text("use-cases.description")} /></p></section>
      <section className="subpage-section" aria-labelledby="knowledge-screenshots-heading"><div className="eyebrow">{content.text("screenshots.eyebrow")}</div><h2 id="knowledge-screenshots-heading"><MarkdownText text={content.text("screenshots.title")} /></h2><div className="screenshot-grid">{screenshots.map((screenshot) => <figure className="screenshot-card media-frame media-frame-evidence" key={screenshot.src}><div className="screenshot-media"><Image src={screenshot.src} alt={screenshot.alt} fill sizes="(max-width: 767px) 100vw, 50vw" /></div><figcaption>{screenshot.caption}</figcaption></figure>)}</div></section>
    </SubpageShell>
  );
}
