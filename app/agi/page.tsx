import type { Metadata } from "next";
import SubpageShell from "../_components/SubpageShell";
import source from "@/content/pages/agi.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const content = parsePageMarkdown(source);
export const metadata: Metadata = { title: content.text("metadata.title"), description: content.text("metadata.description") };

export default function AgiPage() {
  return <SubpageShell eyebrow={content.text("hero.eyebrow")} title={content.text("hero.title")} description={content.text("hero.description")} action={{ href: "/contact", label: content.text("action.label") }}><section className="subpage-section subpage-two-column"><div><div className="eyebrow">{content.text("capabilities.eyebrow")}</div><h2><MarkdownText text={content.text("capabilities.title")} /></h2></div><ol className="subpage-list ordered">{content.lines("capabilities.items").map((item) => <li key={item}>{item}</li>)}</ol></section><section className="subpage-section"><div className="eyebrow">{content.text("flow.eyebrow")}</div><h2><MarkdownText text={content.text("flow.title")} /></h2><p className="subpage-wide-copy"><MarkdownText text={content.text("flow.description")} /></p><div className="deployment-tags">{content.lines("deployment.items").map((item) => <span key={item}>{item}</span>)}</div></section></SubpageShell>;
}
