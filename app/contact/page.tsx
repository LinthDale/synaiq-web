import type { Metadata } from "next";
import SubpageShell from "../_components/SubpageShell";
import source from "@/content/pages/contact.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const content = parsePageMarkdown(source);
export const metadata: Metadata = { title: content.text("metadata.title"), description: content.text("metadata.description") };

export default function ContactPage() {
  return <SubpageShell eyebrow={content.text("hero.eyebrow")} title={content.text("hero.title")} description={content.text("hero.description")} pageClassName="contact-page" action={{ href: "mailto:service@synaiq.com", label: content.text("action.label"), eyebrow: content.text("action.eyebrow"), title: content.text("action.title"), description: content.text("action.description") }}><section className="subpage-section contact-page-grid">{content.table("contact.cards").map((card) => card.href ? <a className="contact-page-card" href={card.href} key={card.eyebrow}><div className="eyebrow">{card.eyebrow}</div><strong>{card.title}</strong><span>{card.detail}</span></a> : <div className="contact-page-card" key={card.eyebrow}><div className="eyebrow">{card.eyebrow}</div><strong>{card.title}</strong><span>{card.detail}</span></div>)}</section><section className="subpage-section consultation-section" aria-labelledby="consultation-heading"><div className="eyebrow">{content.text("consultation.eyebrow")}</div><h2 id="consultation-heading"><MarkdownText text={content.text("consultation.title")} /></h2><ol className="consultation-flow">{content.table("consultation.steps").map((step) => <li key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol></section></SubpageShell>;
}
