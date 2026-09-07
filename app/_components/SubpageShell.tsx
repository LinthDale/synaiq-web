import type { ReactNode } from "react";
import Image from "next/image";
import SiteHeader from "./SiteHeader";
import siteSource from "@/content/pages/site.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const siteContent = parsePageMarkdown(siteSource);

type SubpageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  heroVisual?: ReactNode;
  action?: {
    href: string;
    label: string;
    eyebrow?: string | null;
    title?: string;
    description?: string;
  };
  pageClassName?: string;
};

export default function SubpageShell({ eyebrow, title, description, children, heroVisual, action, pageClassName }: SubpageShellProps) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`subpage${pageClassName ? ` ${pageClassName}` : ""}`} tabIndex={-1}>
        <div className="subpage-main">
          <section className={`subpage-hero${heroVisual ? " subpage-hero-with-visual" : ""}`}>
            <div className="subpage-hero-copy">
              {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
              <h1><MarkdownText text={title} /></h1>
              <p><MarkdownText text={description} /></p>
            </div>
            {heroVisual ? <div className="subpage-hero-visual">{heroVisual}</div> : null}
          </section>
          {children}
          {action ? (
            <section className="subpage-cta">
              <div>
                {action.eyebrow !== null ? <div className="eyebrow">{action.eyebrow ?? siteContent.text("action.default-eyebrow")}</div> : null}
                <h2><MarkdownText text={action.title ?? siteContent.text("action.default-title")} /></h2>
                {action.description ? <p className="subpage-cta-description"><MarkdownText text={action.description} /></p> : null}
              </div>
              <a className="primary-button" href={action.href}>{action.label}</a>
            </section>
          ) : null}
        </div>
        <footer><Image src="/brand/synaiq-logo-light.svg" alt="SynaiQ" width={145} height={25} /><p>{siteContent.text("footer.company")}</p><span>{siteContent.text("footer.copyright")}</span></footer>
      </main>
    </>
  );
}
