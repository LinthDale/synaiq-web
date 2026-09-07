import type { Metadata } from "next";
import ContentStatus from "../_components/ContentStatus";
import EmptyState from "../_components/EmptyState";
import SubpageShell from "../_components/SubpageShell";
import source from "@/content/pages/media.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const content = parsePageMarkdown(source);
export const metadata: Metadata = { title: content.text("metadata.title"), description: content.text("metadata.description") };

export default function MediaPage() {
  return <SubpageShell eyebrow={content.text("hero.eyebrow")} title={content.text("hero.title")} description={content.text("hero.description")} pageClassName="media-page" action={{ href: "/contact", label: content.text("action.label"), eyebrow: content.text("action.eyebrow"), title: content.text("action.title"), description: content.text("action.description") }}>
    <section className="subpage-section media-section" aria-labelledby="news-heading"><div className="eyebrow">{content.text("news.eyebrow")}</div><h2 id="news-heading"><MarkdownText text={content.text("news.title")} /></h2><EmptyState title={content.text("news.empty-title")} description={content.text("news.empty-description")} action={{ href: "/contact", label: content.text("news.empty-action") }} /></section>
    <section className="subpage-section media-section" aria-labelledby="events-heading"><div className="eyebrow">{content.text("events.eyebrow")}</div><h2 id="events-heading"><MarkdownText text={content.text("events.title")} /></h2><article className="media-event-card"><ContentStatus tone="draft">{content.text("event.status")}</ContentStatus><h3>{content.text("event.title")}</h3><dl className="event-details">{content.table("event.details").map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl><div className="event-image-placeholder" role="img" aria-label={content.text("event.image-placeholder")}>{content.text("event.image-placeholder")}</div></article></section>
    <section className="subpage-section media-section" aria-labelledby="social-heading"><div className="eyebrow">{content.text("social.eyebrow")}</div><h2 id="social-heading"><MarkdownText text={content.text("social.title")} /></h2><div className="social-card"><ContentStatus>{content.text("social.status")}</ContentStatus><h3>{content.text("social.platform")}</h3><p><MarkdownText text={content.text("social.description")} /></p><a className="primary-button" href="https://www.instagram.com/synaiq.ai/" target="_blank" rel="noopener noreferrer" aria-label={content.text("social.action-label")}>{content.text("social.action")}</a></div></section>
  </SubpageShell>;
}
