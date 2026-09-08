/**
 * 8 條內頁的「舊 key → 新 frontmatter」對照。
 *
 * 每個 builder 只做搬運，不改文字、不補文字：
 * 舊檔沒有的欄位就不輸出（例如 products 頁沒有 action.eyebrow，
 * 渲染時自動落回 `site` collection 的 defaultAction）。
 * 每一次讀取都經過 recorder，未經 recorder 的 key 會在 migrate-content.mjs 被判為遺漏。
 */

import { createRecorder } from './recorder.mjs';
import {
  HERO_IMAGES,
  MODEL_IMAGES,
  SOCIAL_HREF,
  TEAM_PHOTOS,
  assetFor,
  orUndefined,
  withSlash,
} from './assets.mjs';

const CONTACT_HREF = '/contact/';
const CONTACT_MAILTO = 'mailto:service@synaiq.com';

/** 每頁共用的開頭：metadata 與 hero 的必填三欄。 */
function head(rec, { eyebrow = false } = {}) {
  return {
    metadata: {
      title: rec.text('metadata.title', 'metadata.title'),
      description: rec.text('metadata.description', 'metadata.description'),
    },
    hero: {
      eyebrow: eyebrow ? rec.text('hero.eyebrow', 'hero.eyebrow') : undefined,
      title: rec.text('hero.title', 'hero.title'),
      description: rec.text('hero.description', 'hero.description'),
    },
  };
}

/** 舊樹每頁底部的 CTA。有 eyebrow/title/description 的頁才輸出，其餘落回 site.defaultAction。 */
function actionBlock(rec, { full, href = CONTACT_HREF }) {
  const label = rec.text('action.label', 'action.label');
  if (!full) return { label, href };
  return {
    eyebrow: rec.text('action.eyebrow', 'action.eyebrow'),
    title: rec.text('action.title', 'action.title'),
    description: rec.text('action.description', 'action.description'),
    label,
    href,
  };
}

/** `about.md` → `/about/` */
export function buildAbout(content) {
  const rec = createRecorder(content, { page: 'about', defaultRoute: '/about/' });
  const base = head(rec, { eyebrow: true });

  const members = (key, path) =>
    rec
      .table(key, path, {
        // id 欄同時是照片查表 key 與錨點 id，兩者都會出現在 HTML。
        values: (rows) => rows.flatMap((row) => Object.values(row)),
      })
      .map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        background: row.background,
        src: assetFor(TEAM_PHOTOS, row.id, 'about.team'),
        alt: row.alt,
      }));

  return {
    frontmatter: {
      ...base,
      action: actionBlock(rec, { full: false }),
      blocks: [
        {
          type: 'approach',
          id: 'approach',
          eyebrow: rec.text('approach.eyebrow', 'blocks[approach].eyebrow'),
          title: rec.text('approach.title', 'blocks[approach].title'),
          description: rec.text('approach.description', 'blocks[approach].description'),
          items: rec.lines('approach.items', 'blocks[approach].items[]'),
        },
        {
          type: 'team',
          id: 'team',
          eyebrow: rec.text('team.eyebrow', 'blocks[team].eyebrow'),
          title: rec.text('team.title', 'blocks[team].title'),
          groups: [
            {
              eyebrow: rec.text('team.leadership.eyebrow', 'blocks[team].groups[0].eyebrow'),
              title: rec.text('team.leadership.title', 'blocks[team].groups[0].title'),
              members: members('team.leadership.members', 'blocks[team].groups[0].members[]'),
            },
            {
              eyebrow: rec.text('team.technical.eyebrow', 'blocks[team].groups[1].eyebrow'),
              title: rec.text('team.technical.title', 'blocks[team].groups[1].title'),
              members: members('team.technical.members', 'blocks[team].groups[1].members[]'),
            },
          ],
        },
        {
          type: 'vision',
          id: 'vision',
          eyebrow: rec.text('vision.eyebrow', 'blocks[vision].eyebrow'),
          title: rec.text('vision.title', 'blocks[vision].title'),
          items: rec.lines('vision.items', 'blocks[vision].items[]'),
        },
      ],
    },
    records: rec.records,
    unmapped: rec.unmapped(),
  };
}

/** `products.md` → `/products/` */
export function buildProducts(content) {
  const rec = createRecorder(content, { page: 'products', defaultRoute: '/products/' });
  const base = head(rec);

  return {
    frontmatter: {
      ...base,
      action: actionBlock(rec, { full: false }),
      blocks: [
        {
          type: 'products',
          id: 'products',
          items: rec.table('products', 'blocks[products].items[]').map((row) => ({
            name: row.title,
            description: row.description,
            href: withSlash(row.href),
          })),
          itemAction: rec.text('product.action', 'blocks[products].itemAction'),
        },
      ],
    },
    records: rec.records,
    unmapped: rec.unmapped(),
  };
}

/** `wally.md` → `/wally/` */
export function buildWally(content) {
  const rec = createRecorder(content, { page: 'wally', defaultRoute: '/wally/' });
  const base = head(rec, { eyebrow: true });

  return {
    frontmatter: {
      ...base,
      hero: {
        ...base.hero,
        imageSrc: HERO_IMAGES.wally,
        imageAlt: rec.text('hero.image-alt', 'hero.imageAlt'),
      },
      action: actionBlock(rec, { full: true }),
      blocks: [
        {
          type: 'selection',
          id: 'selection',
          eyebrow: rec.text('selection.eyebrow', 'blocks[selection].eyebrow'),
          title: rec.text('selection.title', 'blocks[selection].title'),
          items: rec
            .table('selection.items', 'blocks[selection].items[]')
            .map((row) => ({ title: row.title, description: row.description })),
        },
        {
          type: 'models',
          id: 'models',
          eyebrow: rec.text('models.eyebrow', 'blocks[models].eyebrow'),
          title: rec.text('models.title', 'blocks[models].title'),
          navigationLabel: rec.text('models.navigation-label', 'blocks[models].navigationLabel'),
          comparisonLabel: rec.text('models.comparison-label', 'blocks[models].comparisonLabel'),
          comparisonHeadings: rec.lines(
            'models.comparison-headings',
            'blocks[models].comparisonHeadings[]',
          ),
          scenarioLabel: rec.text('models.scenario-label', 'blocks[models].scenarioLabel'),
          items: rec.table('models', 'blocks[models].items[]').map((row) => ({
            id: row.id,
            name: row.name,
            src: assetFor(MODEL_IMAGES, row.id, 'wally.models'),
            alt: row.alt,
            positioning: row.positioning,
            features: [row['feature-1'], row['feature-2'], row['feature-3']].filter(Boolean),
            scenario: row.scenario,
            mode: row.mode,
          })),
        },
        {
          type: 'features',
          id: 'features',
          eyebrow: rec.text('features.eyebrow', 'blocks[features].eyebrow'),
          title: rec.text('features.title', 'blocks[features].title'),
          items: rec.lines('features.items', 'blocks[features].items[]'),
        },
        {
          type: 'supporting',
          id: 'supporting',
          eyebrow: rec.text('supporting.eyebrow', 'blocks[supporting].eyebrow'),
          title: rec.text('supporting.title', 'blocks[supporting].title'),
          photos: rec
            .table('supporting.photos', 'blocks[supporting].photos[]')
            .map((row) => ({ src: row.src, alt: row.alt, caption: orUndefined(row.caption) })),
        },
      ],
    },
    records: rec.records,
    unmapped: rec.unmapped(),
  };
}

/** `knowledge-base.md` → `/knowledge-base/` */
export function buildKnowledgeBase(content) {
  const rec = createRecorder(content, { page: 'knowledge-base', defaultRoute: '/knowledge-base/' });
  const base = head(rec, { eyebrow: true });

  return {
    frontmatter: {
      ...base,
      hero: {
        ...base.hero,
        caption: rec.text('hero.caption', 'hero.caption'),
        imageSrc: HERO_IMAGES['knowledge-base'],
        imageAlt: rec.text('hero.image-alt', 'hero.imageAlt'),
      },
      action: actionBlock(rec, { full: true }),
      blocks: [
        {
          type: 'capabilities',
          id: 'capabilities',
          eyebrow: rec.text('capabilities.eyebrow', 'blocks[capabilities].eyebrow'),
          title: rec.text('capabilities.title', 'blocks[capabilities].title'),
          items: rec.lines('capabilities.items', 'blocks[capabilities].items[]'),
        },
        {
          type: 'useCases',
          id: 'use-cases',
          eyebrow: rec.text('use-cases.eyebrow', 'blocks[useCases].eyebrow'),
          title: rec.text('use-cases.title', 'blocks[useCases].title'),
          description: rec.text('use-cases.description', 'blocks[useCases].description'),
        },
        {
          type: 'screenshots',
          id: 'screenshots',
          eyebrow: rec.text('screenshots.eyebrow', 'blocks[screenshots].eyebrow'),
          title: rec.text('screenshots.title', 'blocks[screenshots].title'),
          items: rec
            .table('screenshots', 'blocks[screenshots].items[]')
            .map((row) => ({ src: row.src, alt: row.alt, caption: orUndefined(row.caption) })),
        },
      ],
    },
    records: rec.records,
    unmapped: rec.unmapped(),
  };
}

/** `generative-ai.md` → `/generative-ai/` */
export function buildGenerativeAi(content) {
  const rec = createRecorder(content, { page: 'generative-ai', defaultRoute: '/generative-ai/' });
  const base = head(rec, { eyebrow: true });

  return {
    frontmatter: {
      ...base,
      hero: {
        ...base.hero,
        caption: rec.text('hero.caption', 'hero.caption'),
        imageSrc: HERO_IMAGES['generative-ai'],
        imageAlt: rec.text('hero.image-alt', 'hero.imageAlt'),
      },
      action: actionBlock(rec, { full: true }),
      blocks: [
        {
          type: 'services',
          id: 'services',
          eyebrow: rec.text('services.eyebrow', 'blocks[services].eyebrow'),
          title: rec.text('services.title', 'blocks[services].title'),
          items: rec.lines('services.items', 'blocks[services].items[]'),
        },
        {
          type: 'flow',
          id: 'flow',
          eyebrow: rec.text('flow.eyebrow', 'blocks[flow].eyebrow'),
          title: rec.text('flow.title', 'blocks[flow].title'),
          steps: rec.lines('flow.steps', 'blocks[flow].steps[]'),
        },
      ],
    },
    records: rec.records,
    unmapped: rec.unmapped(),
  };
}

/** `agi.md` → `/agi/` */
export function buildAgi(content) {
  const rec = createRecorder(content, { page: 'agi', defaultRoute: '/agi/' });
  const base = head(rec, { eyebrow: true });

  return {
    frontmatter: {
      ...base,
      action: actionBlock(rec, { full: false }),
      blocks: [
        {
          type: 'capabilities',
          id: 'capabilities',
          eyebrow: rec.text('capabilities.eyebrow', 'blocks[capabilities].eyebrow'),
          title: rec.text('capabilities.title', 'blocks[capabilities].title'),
          // 舊樹以 <ol> 呈現（來源是 `1.` 編號清單）。
          ordered: true,
          items: rec.lines('capabilities.items', 'blocks[capabilities].items[]'),
        },
        {
          type: 'flow',
          id: 'flow',
          eyebrow: rec.text('flow.eyebrow', 'blocks[flow].eyebrow'),
          title: rec.text('flow.title', 'blocks[flow].title'),
          description: rec.text('flow.description', 'blocks[flow].description'),
        },
        {
          type: 'deployment',
          id: 'deployment',
          // 舊樹此區塊沒有標題，只有標籤列；不虛構標題。
          items: rec.lines('deployment.items', 'blocks[deployment].items[]'),
        },
      ],
    },
    records: rec.records,
    unmapped: rec.unmapped(),
  };
}

/** `media.md` → `/media/` */
export function buildMedia(content) {
  const rec = createRecorder(content, { page: 'media', defaultRoute: '/media/' });
  const base = head(rec, { eyebrow: true });

  return {
    frontmatter: {
      ...base,
      action: actionBlock(rec, { full: true }),
      blocks: [
        {
          type: 'news',
          id: 'news',
          eyebrow: rec.text('news.eyebrow', 'blocks[news].eyebrow'),
          title: rec.text('news.title', 'blocks[news].title'),
          empty: {
            title: rec.text('news.empty-title', 'blocks[news].empty.title'),
            description: rec.text('news.empty-description', 'blocks[news].empty.description'),
            action: {
              label: rec.text('news.empty-action', 'blocks[news].empty.action.label'),
              href: CONTACT_HREF,
            },
          },
        },
        {
          type: 'events',
          id: 'events',
          eyebrow: rec.text('events.eyebrow', 'blocks[events].eyebrow'),
          title: rec.text('events.title', 'blocks[events].title'),
          items: [
            {
              title: rec.text('event.title', 'blocks[events].items[0].title'),
              status: rec.text('event.status', 'blocks[events].items[0].status'),
              details: rec
                .table('event.details', 'blocks[events].items[0].details[]')
                .map((row) => ({ label: row.label, value: row.value })),
              imagePlaceholder: rec.text(
                'event.image-placeholder',
                'blocks[events].items[0].imagePlaceholder',
              ),
            },
          ],
        },
        {
          type: 'social',
          id: 'social',
          eyebrow: rec.text('social.eyebrow', 'blocks[social].eyebrow'),
          title: rec.text('social.title', 'blocks[social].title'),
          platform: rec.text('social.platform', 'blocks[social].platform'),
          status: rec.text('social.status', 'blocks[social].status'),
          description: rec.text('social.description', 'blocks[social].description'),
          action: rec.text('social.action', 'blocks[social].action'),
          actionLabel: rec.text('social.action-label', 'blocks[social].actionLabel'),
          href: SOCIAL_HREF,
        },
      ],
    },
    records: rec.records,
    unmapped: rec.unmapped(),
  };
}

/** `contact.md` → `/contact/` */
export function buildContact(content) {
  const rec = createRecorder(content, { page: 'contact', defaultRoute: '/contact/' });
  const base = head(rec, { eyebrow: true });

  return {
    frontmatter: {
      ...base,
      action: actionBlock(rec, { full: true, href: CONTACT_MAILTO }),
      blocks: [
        {
          type: 'contact',
          id: 'contact-cards',
          // 舊樹此區塊沒有標題；不虛構標題。
          cards: rec.table('contact.cards', 'blocks[contact].cards[]').map((row) => ({
            eyebrow: row.eyebrow,
            title: row.title,
            detail: orUndefined(row.detail),
            href: orUndefined(row.href),
          })),
        },
        {
          type: 'consultation',
          id: 'consultation',
          eyebrow: rec.text('consultation.eyebrow', 'blocks[consultation].eyebrow'),
          title: rec.text('consultation.title', 'blocks[consultation].title'),
          steps: rec.table('consultation.steps', 'blocks[consultation].steps[]').map((row) => ({
            number: row.number,
            title: row.title,
            description: row.description,
          })),
        },
      ],
    },
    records: rec.records,
    unmapped: rec.unmapped(),
  };
}

/** slug → builder。`site` 與 `home` 在 map-site.mjs。 */
export const PAGE_BUILDERS = {
  about: buildAbout,
  products: buildProducts,
  wally: buildWally,
  'knowledge-base': buildKnowledgeBase,
  'generative-ai': buildGenerativeAi,
  agi: buildAgi,
  media: buildMedia,
  contact: buildContact,
};
