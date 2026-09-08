import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content Collections schema（PRD-001 FR-103）。
 *
 * - 每個語系一個目錄／一個檔案，路徑即語系。
 * - 缺任一必填欄位 → `astro build` 失敗，訊息含檔名與欄位路徑。
 * - 新增語系只需加目錄與 `src/config/site.ts` 一行，本檔與所有 `.astro` 都不必改。
 */

/* -------------------------------------------------------------------------- */
/* 共用片段                                                                    */
/* -------------------------------------------------------------------------- */

const link = z.object({
  label: z.string(),
  href: z.string(),
});

const figure = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

/** 每個 block 共用的外框欄位。 */
const blockBase = {
  /** 章節錨點 id；`pageNav` 的連結指向它。 */
  id: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
};

function block<T extends string, S extends z.ZodRawShape>(type: T, shape: S) {
  return z.object({ type: z.literal(type), ...blockBase, ...shape });
}

/* -------------------------------------------------------------------------- */
/* blocks[]：z.discriminatedUnion('type', …)                                   */
/* -------------------------------------------------------------------------- */

const blocks = z.discriminatedUnion('type', [
  block('services', {
    items: z.array(z.string()).min(1),
    documents: z.array(z.object({ kind: z.string(), label: z.string() })).default([]),
    target: z.string().optional(),
  }),
  block('products', {
    items: z.array(z.object({ name: z.string(), description: z.string(), href: z.string() })).min(1),
    itemAction: z.string(),
  }),
  block('technology', {
    abilities: z
      .array(z.object({ code: z.string(), title: z.string(), description: z.string() }))
      .min(1),
  }),
  block('experience', {
    items: z.array(z.string()).default([]),
    images: z.array(figure).default([]),
    devicesLabel: z.string(),
    devices: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
  }),
  block('capabilities', {
    items: z.array(z.string()).min(1),
    /** true → 以 <ol> 呈現（語意上是有序步驟）。 */
    ordered: z.boolean().default(false),
  }),
  block('features', { items: z.array(z.string()).min(1) }),
  block('vision', { items: z.array(z.string()).min(1) }),
  block('approach', { items: z.array(z.string()).min(1) }),
  block('selection', {
    items: z.array(z.object({ title: z.string(), description: z.string() })).min(1),
  }),
  block('flow', { steps: z.array(z.string()).default([]) }),
  block('models', {
    navigationLabel: z.string(),
    comparisonLabel: z.string(),
    comparisonHeadings: z.array(z.string()).min(1),
    scenarioLabel: z.string(),
    items: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          src: z.string(),
          alt: z.string(),
          positioning: z.string(),
          features: z.array(z.string()).default([]),
          scenario: z.string(),
          mode: z.string(),
        }),
      )
      .min(1),
  }),
  block('screenshots', { items: z.array(figure).default([]) }),
  block('team', {
    groups: z
      .array(
        z.object({
          eyebrow: z.string(),
          title: z.string(),
          members: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                role: z.string(),
                background: z.string(),
                src: z.string(),
                alt: z.string(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  }),
  block('supporting', { photos: z.array(figure).default([]) }),
  block('news', {
    empty: z.object({ title: z.string(), description: z.string(), action: link }),
  }),
  block('events', {
    items: z
      .array(
        z.object({
          title: z.string(),
          status: z.string(),
          details: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
          imagePlaceholder: z.string(),
        }),
      )
      .default([]),
  }),
  block('social', {
    platform: z.string(),
    status: z.string(),
    description: z.string(),
    action: z.string(),
    actionLabel: z.string(),
    href: z.string(),
  }),
  block('consultation', {
    steps: z
      .array(z.object({ number: z.string(), title: z.string(), description: z.string() }))
      .min(1),
  }),
  block('contact', {
    cards: z
      .array(
        z.object({
          eyebrow: z.string(),
          title: z.string(),
          detail: z.string().optional(),
          href: z.string().optional(),
        }),
      )
      .min(1),
  }),
  block('deployment', { items: z.array(z.string()).min(1) }),
  block('useCases', { description: z.string() }),
]);

export type PageBlock = z.infer<typeof blocks>;
export type PageBlockType = PageBlock['type'];

/* -------------------------------------------------------------------------- */
/* collections                                                                 */
/* -------------------------------------------------------------------------- */

const site = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/site' }),
  schema: z.object({
    /** `%s` 會被各頁 metadata.title 取代；首頁不套用。 */
    titleTemplate: z.string(),
    localeName: z.string(),
    languageSwitcherLabel: z.string(),
    header: z.object({
      skipLink: z.string(),
      homeLabel: z.string(),
      menuOpen: z.string(),
      menuClose: z.string(),
      navigationLabel: z.string(),
    }),
    nav: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          style: z.enum(['link', 'cta']),
        }),
      )
      .min(1),
    footer: z.object({ company: z.string(), copyright: z.string() }),
    defaultAction: z.object({ eyebrow: z.string(), title: z.string() }),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    draft: z.boolean().default(false),
    metadata: z.object({
      title: z.string(),
      description: z.string(),
      titleTemplate: z.string().optional(),
      ogImage: z.string().optional(),
    }),
    hero: z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      description: z.string(),
      caption: z.string().optional(),
      imageSrc: z.string().optional(),
      imageAlt: z.string().optional(),
      scrollHint: z.string().optional(),
      primaryAction: link.optional(),
      secondaryAction: link.optional(),
    }),
    /** 頁內章節導覽（首頁的 `navigation.labels`）。 */
    pageNav: z.object({ label: z.string(), items: z.array(link).min(1) }).optional(),
    action: z.object({
      eyebrow: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      label: z.string(),
      href: z.string(),
    }),
    blocks: z.array(blocks).default([]),
  }),
});

export const collections = { site, pages };
