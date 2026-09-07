import Image from "next/image";
import type { Metadata } from "next";
import SubpageShell from "../_components/SubpageShell";
import source from "@/content/pages/about.md?raw";
import { MarkdownText, parsePageMarkdown } from "../_content/markdown";

const content = parsePageMarkdown(source);
const teamPhotos = {
  wilson: "/brand/team/wilson-web-1.jpg", sunny: "/brand/team/sunny-web-1.1.jpg", leef: "/brand/team/leff-web-1.jpg",
  lou: "/brand/team/lou-web-1.jpg", dale: "/brand/team/dale-web-1.jpg", daniel: "/brand/team/daniel-web-1.jpg",
} as const;
const withPhotos = (key: string) => content.table(key).map((member) => ({ ...member, photo: teamPhotos[member.id as keyof typeof teamPhotos] }));
const leadership = withPhotos("team.leadership.members");
const technical = withPhotos("team.technical.members");

export const metadata: Metadata = { title: content.text("metadata.title"), description: content.text("metadata.description") };

function TeamGroup({ eyebrow, title, members }: { eyebrow: string; title: string; members: typeof leadership }) {
  return <div className="team-group"><div className="eyebrow">{eyebrow}</div><h3 className="team-group-title"><MarkdownText text={title} /></h3><div className="team-grid">{members.map((member) => <article className="team-card" key={member.id}><div className="team-photo media-frame media-frame-portrait"><Image src={member.photo} alt={member.alt} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw" /></div><h3 className="team-card-name">{member.name}</h3><span>{member.role}</span><p><MarkdownText text={member.background} /></p></article>)}</div></div>;
}

export default function AboutPage() {
  return (
    <SubpageShell eyebrow={content.text("hero.eyebrow")} title={content.text("hero.title")} description={content.text("hero.description")} pageClassName="about-page" action={{ href: "/contact", label: content.text("action.label") }}>
      <section className="subpage-section subpage-two-column"><div><div className="eyebrow">{content.text("approach.eyebrow")}</div><h2><MarkdownText text={content.text("approach.title")} /></h2></div><div className="subpage-copy"><p><MarkdownText text={content.text("approach.description")} /></p><ul className="subpage-list">{content.lines("approach.items").map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      <section className="subpage-section"><div className="eyebrow">{content.text("team.eyebrow")}</div><h2><MarkdownText text={content.text("team.title")} /></h2><TeamGroup eyebrow={content.text("team.leadership.eyebrow")} title={content.text("team.leadership.title")} members={leadership} /><TeamGroup eyebrow={content.text("team.technical.eyebrow")} title={content.text("team.technical.title")} members={technical} /></section>
      <section className="subpage-section subpage-two-column"><div><div className="eyebrow">{content.text("vision.eyebrow")}</div><h2><MarkdownText text={content.text("vision.title")} /></h2></div><ul className="subpage-list">{content.lines("vision.items").map((item) => <li key={item}>{item}</li>)}</ul></section>
    </SubpageShell>
  );
}
