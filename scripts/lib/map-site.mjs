import { createRecorder } from './recorder.mjs';
import {
  EXPERIENCE_DEVICES,
  EXPERIENCE_IMAGES,
  HERO_IMAGES,
  assetFor,
  withSlash,
} from './assets.mjs';

/** `site.md` → `src/content/site/<locale>.md` */
export function buildSite(content) {
  const rec = createRecorder(content, { page: 'site', defaultRoute: '/' });

  const frontmatter = {
    // `%s｜SynaiQ` 舊樹放在 home.md，新樹屬全站設定，於 buildHome() 回填。
    titleTemplate: null,
    localeName: null,
    languageSwitcherLabel: null,
    header: {
      skipLink: rec.text('header.skip-link', 'header.skipLink'),
      homeLabel: rec.text('header.home-label', 'header.homeLabel'),
      menuOpen: rec.text('header.menu-open', 'header.menuOpen'),
      menuClose: rec.text('header.menu-close', 'header.menuClose'),
      navigationLabel: rec.text('header.navigation-label', 'header.navigationLabel'),
    },
    nav: rec.table('header.navigation', 'nav[]').map((row) => ({
      label: row.label,
      href: withSlash(row.href),
      style: row.style,
    })),
    footer: {
      company: rec.text('footer.company', 'footer.company'),
      copyright: rec.text('footer.copyright', 'footer.copyright'),
    },
    defaultAction: {
      // 只有在頁面自己沒給 eyebrow/title 時才渲染，故驗證路由指向 /about/。
      eyebrow: rec.text('action.default-eyebrow', 'defaultAction.eyebrow', { route: '/about/' }),
      title: rec.text('action.default-title', 'defaultAction.title', { route: '/about/' }),
    },
  };

  return { frontmatter, records: rec.records, unmapped: rec.unmapped() };
}

/** `home.md` → `src/content/pages/<locale>/home.md` */
export function buildHome(content) {
  const rec = createRecorder(content, { page: 'home', defaultRoute: '/' });

  const titleTemplate = rec.custom(
    'metadata.title-template',
    'site/<locale>.md → titleTemplate',
    content.text('metadata.title-template'),
    // `%s` 於建置期被各頁標題取代，HTML 中只留下固定尾綴。
    ['｜SynaiQ'],
    { route: '/about/' },
  );

  const navLabels = rec.lines('navigation.labels', 'pageNav.items[].label');
  const sectionIds = ['brand', 'services', 'products', 'technology', 'experience', 'action'];
  if (navLabels.length !== sectionIds.length) {
    throw new Error(
      `home.md 的 navigation.labels 應有 ${sectionIds.length} 項，實際 ${navLabels.length} 項；` +
        '請同步更新 scripts/lib/map-site.mjs 的 sectionIds。',
    );
  }

  const frontmatter = {
    metadata: {
      title: rec.text('metadata.title', 'metadata.title'),
      description: rec.text('metadata.description', 'metadata.description'),
    },
    hero: {
      title: rec.text('hero.title', 'hero.title'),
      description: rec.text('hero.description', 'hero.description'),
      imageSrc: HERO_IMAGES.home,
      imageAlt: rec.text('hero.image-alt', 'hero.imageAlt'),
      scrollHint: rec.text('hero.scroll-hint', 'hero.scrollHint'),
      primaryAction: {
        label: rec.text('hero.primary-action', 'hero.primaryAction.label'),
        href: '#services',
      },
      secondaryAction: {
        label: rec.text('hero.secondary-action', 'hero.secondaryAction.label'),
        href: '/about/',
      },
    },
    pageNav: {
      label: '首頁章節導覽',
      items: navLabels.map((label, index) => ({ label, href: `#${sectionIds[index]}` })),
    },
    action: {
      title: rec.text('action.title', 'action.title'),
      description: rec.text('action.description', 'action.description'),
      label: rec.text('action.label', 'action.label'),
      href: '#contact',
    },
    blocks: [
      {
        type: 'services',
        id: 'services',
        title: rec.text('services.title', 'blocks[services].title'),
        description: rec.text('services.description', 'blocks[services].description'),
        items: rec.lines('services.items', 'blocks[services].items[]'),
        documents: rec
          .table('services.documents', 'blocks[services].documents[]')
          .map((row) => ({ kind: row.kind, label: row.label })),
        target: rec.text('services.target', 'blocks[services].target'),
      },
      {
        type: 'products',
        id: 'products',
        title: rec.text('products.title', 'blocks[products].title'),
        description: rec.text('products.description', 'blocks[products].description'),
        items: rec.table('products.items', 'blocks[products].items[]').map((row) => ({
          name: row.name,
          description: row.description,
          href: withSlash(row.href),
        })),
        itemAction: rec.text('products.item-action', 'blocks[products].itemAction'),
      },
      {
        type: 'technology',
        id: 'technology',
        title: rec.text('technology.title', 'blocks[technology].title'),
        abilities: rec.table('technology.abilities', 'blocks[technology].abilities[]').map((row) => ({
          code: row.code,
          title: row.title,
          description: row.description,
        })),
      },
      {
        type: 'experience',
        id: 'experience',
        title: rec.text('experience.title', 'blocks[experience].title'),
        description: rec.text('experience.description', 'blocks[experience].description'),
        items: rec.lines('experience.items', 'blocks[experience].items[]'),
        images: [
          {
            src: EXPERIENCE_IMAGES.knowledge,
            alt: rec.text('experience.knowledge-alt', 'blocks[experience].images[0].alt'),
            caption: rec.text('experience.knowledge-caption', 'blocks[experience].images[0].caption'),
          },
          {
            src: EXPERIENCE_IMAGES.generative,
            alt: rec.text('experience.generative-alt', 'blocks[experience].images[1].alt'),
            caption: rec.text(
              'experience.generative-caption',
              'blocks[experience].images[1].caption',
            ),
          },
        ],
        devicesLabel: rec.text('experience.devices-label', 'blocks[experience].devicesLabel'),
        devices: [
          {
            src: assetFor(EXPERIENCE_DEVICES, 'wally-1', 'home.experience.devices'),
            alt: rec.text('experience.wally-1-alt', 'blocks[experience].devices[0].alt'),
          },
          {
            src: assetFor(EXPERIENCE_DEVICES, 'wally-mini', 'home.experience.devices'),
            alt: rec.text('experience.wally-mini-alt', 'blocks[experience].devices[1].alt'),
          },
        ],
      },
      {
        type: 'contact',
        id: 'contact',
        title: rec.text('contact.title', 'blocks[contact].title'),
        description: rec.text('contact.description', 'blocks[contact].description'),
        cards: rec.table('contact.cards', 'blocks[contact].cards[]').map((row) => ({
          eyebrow: row.eyebrow,
          title: row.title,
          href: row.href?.trim() ? row.href.trim() : undefined,
        })),
      },
    ],
  };

  return { frontmatter, titleTemplate, records: rec.records, unmapped: rec.unmapped() };
}
