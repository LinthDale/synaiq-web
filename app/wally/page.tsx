import Image from "next/image";
import type { Metadata } from "next";
import SubpageShell from "../_components/SubpageShell";
import source from "@/content/pages/wally.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const content = parsePageMarkdown(source);
const modelImages = {
  "wally-1": "/brand/wally-1.png",
  "wally-1-plus": "/brand/wally/wally-1-plus.png",
  "wally-2": "/brand/wally/wally-2.png",
  "wally-2-plus": "/brand/wally-2-plus.png",
  "wally-mini": "/brand/wally-mini.png",
} as const;
const models = content.table("models").map((model) => ({ ...model, src: modelImages[model.id as keyof typeof modelImages], features: [model["feature-1"], model["feature-2"], model["feature-3"]] }));
const supportingPhotos = content.table("supporting.photos");
const comparisonHeadings = content.lines("models.comparison-headings");

export const metadata: Metadata = { title: content.text("metadata.title"), description: content.text("metadata.description") };

export default function WallyPage() {
  return (
    <SubpageShell
      eyebrow={content.text("hero.eyebrow")}
      title={content.text("hero.title")}
      description={content.text("hero.description")}
      pageClassName="wally-page"
      heroVisual={<figure className="wally-hero-visual"><div className="wally-hero-visual-media"><Image src="/brand/wally/wally-series.png" alt={content.text("hero.image-alt")} fill priority sizes="(max-width: 900px) 100vw, 48vw" /></div></figure>}
      action={{ href: "/contact", label: content.text("action.label"), eyebrow: content.text("action.eyebrow"), title: content.text("action.title"), description: content.text("action.description") }}
    >
      <section className="subpage-section wally-selection-section" aria-labelledby="wally-selection-heading">
        <div className="eyebrow">{content.text("selection.eyebrow")}</div><h2 id="wally-selection-heading"><MarkdownText text={content.text("selection.title")} /></h2>
        <div className="wally-selection-grid">{content.table("selection.items").map((item) => <div key={item.title}><strong>{item.title}</strong><span>{item.description}</span></div>)}</div>
      </section>

      <section className="subpage-section" aria-labelledby="wally-models-heading">
        <div className="eyebrow">{content.text("models.eyebrow")}</div><h2 id="wally-models-heading"><MarkdownText text={content.text("models.title")} /></h2>
        <nav className="model-anchor-nav" aria-label={content.text("models.navigation-label")}>{models.map((model) => <a key={model.id} href={`#${model.id}`}>{model.name}</a>)}</nav>
        <div className="model-comparison" role="table" aria-label={content.text("models.comparison-label")}>
          <div className="model-comparison-row model-comparison-head" role="row">{comparisonHeadings.map((heading) => <span role="columnheader" key={heading}>{heading}</span>)}</div>
          {models.map((model) => <div className="model-comparison-row" role="row" key={model.id}><strong role="cell">{model.name}</strong><span role="cell">{model.scenario}</span><span role="cell">{model.mode}</span></div>)}
        </div>
        <div className="model-grid">{models.map((model, index) => <article className={`model-card model-card-${model.id}`} id={model.id} key={model.id}><div className="model-card-media media-frame media-frame-product"><Image src={model.src} alt={model.alt} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, (max-width: 1199px) 33vw, 20vw" priority={index === 0} /></div><div className="model-card-content"><h3>{model.name}</h3><p><MarkdownText text={model.positioning} /></p><ul className="model-feature-list">{model.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><p className="model-scenario"><span>{content.text("models.scenario-label")}</span>{model.scenario}</p></div></article>)}</div>
      </section>

      <section className="subpage-section subpage-two-column"><div><div className="eyebrow">{content.text("features.eyebrow")}</div><h2><MarkdownText text={content.text("features.title")} /></h2></div><ul className="subpage-list">{content.lines("features.items").map((feature) => <li key={feature}>{feature}</li>)}</ul></section>

      <section className="subpage-section" aria-labelledby="wally-supporting-heading">
        <div className="eyebrow">{content.text("supporting.eyebrow")}</div><h2 id="wally-supporting-heading"><MarkdownText text={content.text("supporting.title")} /></h2>
        {supportingPhotos.length ? <div className="scenario-gallery-wide">{supportingPhotos.map((photo) => <figure className="scenario-gallery-photo" key={photo.src}><div className="scenario-gallery-photo-media"><Image src={photo.src} alt={photo.alt} fill sizes="100vw" /></div>{photo.caption ? <figcaption>{photo.caption}</figcaption> : null}</figure>)}</div> : null}
      </section>
    </SubpageShell>
  );
}
