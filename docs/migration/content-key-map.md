# 舊 key → 新 frontmatter 對照表（PRD-001 FR-104）

> 由 `npm run migrate:content` 產生，**請勿手改**。
> 「驗證路由」欄是 `npm test` 檢查該 key 文字是否出現在建置後 HTML 的位置。

## 逐檔統計

| 舊檔 | 已對應 key 數 | 未對應 key 數 |
|---|---|---|
| `site.md` | 10 | 0 |
| `home.md` | 37 | 0 |
| `about.md` | 21 | 0 |
| `products.md` | 7 | 0 |
| `wally.md` | 26 | 0 |
| `knowledge-base.md` | 20 | 0 |
| `generative-ai.md` | 17 | 0 |
| `agi.md` | 13 | 0 |
| `media.md` | 27 | 0 |
| `contact.md` | 13 | 0 |
| **合計** | **191** | **0** |

## 逐 key 對照

| 舊檔 | 舊 key | 型別 | 新欄位路徑 | 驗證路由 |
|---|---|---|---|---|
| `site.md` | `header.skip-link` | text | `header.skipLink` | `/` |
| `site.md` | `header.home-label` | text | `header.homeLabel` | `/` |
| `site.md` | `header.menu-open` | text | `header.menuOpen` | `/` |
| `site.md` | `header.menu-close` | text | `header.menuClose` | `/` |
| `site.md` | `header.navigation-label` | text | `header.navigationLabel` | `/` |
| `site.md` | `header.navigation` | table | `nav[]` | `/` |
| `site.md` | `footer.company` | text | `footer.company` | `/` |
| `site.md` | `footer.copyright` | text | `footer.copyright` | `/` |
| `site.md` | `action.default-eyebrow` | text | `defaultAction.eyebrow` | `/about/` |
| `site.md` | `action.default-title` | text | `defaultAction.title` | `/about/` |
| `home.md` | `metadata.title-template` | custom | `site/<locale>.md → titleTemplate` | `/about/` |
| `home.md` | `navigation.labels` | lines | `pageNav.items[].label` | `/` |
| `home.md` | `metadata.title` | text | `metadata.title` | `/` |
| `home.md` | `metadata.description` | text | `metadata.description` | `/` |
| `home.md` | `hero.title` | text | `hero.title` | `/` |
| `home.md` | `hero.description` | text | `hero.description` | `/` |
| `home.md` | `hero.image-alt` | text | `hero.imageAlt` | `/` |
| `home.md` | `hero.scroll-hint` | text | `hero.scrollHint` | `/` |
| `home.md` | `hero.primary-action` | text | `hero.primaryAction.label` | `/` |
| `home.md` | `hero.secondary-action` | text | `hero.secondaryAction.label` | `/` |
| `home.md` | `action.title` | text | `action.title` | `/` |
| `home.md` | `action.description` | text | `action.description` | `/` |
| `home.md` | `action.label` | text | `action.label` | `/` |
| `home.md` | `services.title` | text | `blocks[services].title` | `/` |
| `home.md` | `services.description` | text | `blocks[services].description` | `/` |
| `home.md` | `services.items` | lines | `blocks[services].items[]` | `/` |
| `home.md` | `services.documents` | table | `blocks[services].documents[]` | `/` |
| `home.md` | `services.target` | text | `blocks[services].target` | `/` |
| `home.md` | `products.title` | text | `blocks[products].title` | `/` |
| `home.md` | `products.description` | text | `blocks[products].description` | `/` |
| `home.md` | `products.items` | table | `blocks[products].items[]` | `/` |
| `home.md` | `products.item-action` | text | `blocks[products].itemAction` | `/` |
| `home.md` | `technology.title` | text | `blocks[technology].title` | `/` |
| `home.md` | `technology.abilities` | table | `blocks[technology].abilities[]` | `/` |
| `home.md` | `experience.title` | text | `blocks[experience].title` | `/` |
| `home.md` | `experience.description` | text | `blocks[experience].description` | `/` |
| `home.md` | `experience.items` | lines | `blocks[experience].items[]` | `/` |
| `home.md` | `experience.knowledge-alt` | text | `blocks[experience].images[0].alt` | `/` |
| `home.md` | `experience.knowledge-caption` | text | `blocks[experience].images[0].caption` | `/` |
| `home.md` | `experience.generative-alt` | text | `blocks[experience].images[1].alt` | `/` |
| `home.md` | `experience.generative-caption` | text | `blocks[experience].images[1].caption` | `/` |
| `home.md` | `experience.devices-label` | text | `blocks[experience].devicesLabel` | `/` |
| `home.md` | `experience.wally-1-alt` | text | `blocks[experience].devices[0].alt` | `/` |
| `home.md` | `experience.wally-mini-alt` | text | `blocks[experience].devices[1].alt` | `/` |
| `home.md` | `contact.title` | text | `blocks[contact].title` | `/` |
| `home.md` | `contact.description` | text | `blocks[contact].description` | `/` |
| `home.md` | `contact.cards` | table | `blocks[contact].cards[]` | `/` |
| `about.md` | `metadata.title` | text | `metadata.title` | `/about/` |
| `about.md` | `metadata.description` | text | `metadata.description` | `/about/` |
| `about.md` | `hero.eyebrow` | text | `hero.eyebrow` | `/about/` |
| `about.md` | `hero.title` | text | `hero.title` | `/about/` |
| `about.md` | `hero.description` | text | `hero.description` | `/about/` |
| `about.md` | `action.label` | text | `action.label` | `/about/` |
| `about.md` | `approach.eyebrow` | text | `blocks[approach].eyebrow` | `/about/` |
| `about.md` | `approach.title` | text | `blocks[approach].title` | `/about/` |
| `about.md` | `approach.description` | text | `blocks[approach].description` | `/about/` |
| `about.md` | `approach.items` | lines | `blocks[approach].items[]` | `/about/` |
| `about.md` | `team.eyebrow` | text | `blocks[team].eyebrow` | `/about/` |
| `about.md` | `team.title` | text | `blocks[team].title` | `/about/` |
| `about.md` | `team.leadership.eyebrow` | text | `blocks[team].groups[0].eyebrow` | `/about/` |
| `about.md` | `team.leadership.title` | text | `blocks[team].groups[0].title` | `/about/` |
| `about.md` | `team.leadership.members` | table | `blocks[team].groups[0].members[]` | `/about/` |
| `about.md` | `team.technical.eyebrow` | text | `blocks[team].groups[1].eyebrow` | `/about/` |
| `about.md` | `team.technical.title` | text | `blocks[team].groups[1].title` | `/about/` |
| `about.md` | `team.technical.members` | table | `blocks[team].groups[1].members[]` | `/about/` |
| `about.md` | `vision.eyebrow` | text | `blocks[vision].eyebrow` | `/about/` |
| `about.md` | `vision.title` | text | `blocks[vision].title` | `/about/` |
| `about.md` | `vision.items` | lines | `blocks[vision].items[]` | `/about/` |
| `products.md` | `metadata.title` | text | `metadata.title` | `/products/` |
| `products.md` | `metadata.description` | text | `metadata.description` | `/products/` |
| `products.md` | `hero.title` | text | `hero.title` | `/products/` |
| `products.md` | `hero.description` | text | `hero.description` | `/products/` |
| `products.md` | `action.label` | text | `action.label` | `/products/` |
| `products.md` | `products` | table | `blocks[products].items[]` | `/products/` |
| `products.md` | `product.action` | text | `blocks[products].itemAction` | `/products/` |
| `wally.md` | `metadata.title` | text | `metadata.title` | `/wally/` |
| `wally.md` | `metadata.description` | text | `metadata.description` | `/wally/` |
| `wally.md` | `hero.eyebrow` | text | `hero.eyebrow` | `/wally/` |
| `wally.md` | `hero.title` | text | `hero.title` | `/wally/` |
| `wally.md` | `hero.description` | text | `hero.description` | `/wally/` |
| `wally.md` | `hero.image-alt` | text | `hero.imageAlt` | `/wally/` |
| `wally.md` | `action.label` | text | `action.label` | `/wally/` |
| `wally.md` | `action.eyebrow` | text | `action.eyebrow` | `/wally/` |
| `wally.md` | `action.title` | text | `action.title` | `/wally/` |
| `wally.md` | `action.description` | text | `action.description` | `/wally/` |
| `wally.md` | `selection.eyebrow` | text | `blocks[selection].eyebrow` | `/wally/` |
| `wally.md` | `selection.title` | text | `blocks[selection].title` | `/wally/` |
| `wally.md` | `selection.items` | table | `blocks[selection].items[]` | `/wally/` |
| `wally.md` | `models.eyebrow` | text | `blocks[models].eyebrow` | `/wally/` |
| `wally.md` | `models.title` | text | `blocks[models].title` | `/wally/` |
| `wally.md` | `models.navigation-label` | text | `blocks[models].navigationLabel` | `/wally/` |
| `wally.md` | `models.comparison-label` | text | `blocks[models].comparisonLabel` | `/wally/` |
| `wally.md` | `models.comparison-headings` | lines | `blocks[models].comparisonHeadings[]` | `/wally/` |
| `wally.md` | `models.scenario-label` | text | `blocks[models].scenarioLabel` | `/wally/` |
| `wally.md` | `models` | table | `blocks[models].items[]` | `/wally/` |
| `wally.md` | `features.eyebrow` | text | `blocks[features].eyebrow` | `/wally/` |
| `wally.md` | `features.title` | text | `blocks[features].title` | `/wally/` |
| `wally.md` | `features.items` | lines | `blocks[features].items[]` | `/wally/` |
| `wally.md` | `supporting.eyebrow` | text | `blocks[supporting].eyebrow` | `/wally/` |
| `wally.md` | `supporting.title` | text | `blocks[supporting].title` | `/wally/` |
| `wally.md` | `supporting.photos` | table | `blocks[supporting].photos[]` | `/wally/` |
| `knowledge-base.md` | `metadata.title` | text | `metadata.title` | `/knowledge-base/` |
| `knowledge-base.md` | `metadata.description` | text | `metadata.description` | `/knowledge-base/` |
| `knowledge-base.md` | `hero.eyebrow` | text | `hero.eyebrow` | `/knowledge-base/` |
| `knowledge-base.md` | `hero.title` | text | `hero.title` | `/knowledge-base/` |
| `knowledge-base.md` | `hero.description` | text | `hero.description` | `/knowledge-base/` |
| `knowledge-base.md` | `hero.caption` | text | `hero.caption` | `/knowledge-base/` |
| `knowledge-base.md` | `hero.image-alt` | text | `hero.imageAlt` | `/knowledge-base/` |
| `knowledge-base.md` | `action.label` | text | `action.label` | `/knowledge-base/` |
| `knowledge-base.md` | `action.eyebrow` | text | `action.eyebrow` | `/knowledge-base/` |
| `knowledge-base.md` | `action.title` | text | `action.title` | `/knowledge-base/` |
| `knowledge-base.md` | `action.description` | text | `action.description` | `/knowledge-base/` |
| `knowledge-base.md` | `capabilities.eyebrow` | text | `blocks[capabilities].eyebrow` | `/knowledge-base/` |
| `knowledge-base.md` | `capabilities.title` | text | `blocks[capabilities].title` | `/knowledge-base/` |
| `knowledge-base.md` | `capabilities.items` | lines | `blocks[capabilities].items[]` | `/knowledge-base/` |
| `knowledge-base.md` | `use-cases.eyebrow` | text | `blocks[useCases].eyebrow` | `/knowledge-base/` |
| `knowledge-base.md` | `use-cases.title` | text | `blocks[useCases].title` | `/knowledge-base/` |
| `knowledge-base.md` | `use-cases.description` | text | `blocks[useCases].description` | `/knowledge-base/` |
| `knowledge-base.md` | `screenshots.eyebrow` | text | `blocks[screenshots].eyebrow` | `/knowledge-base/` |
| `knowledge-base.md` | `screenshots.title` | text | `blocks[screenshots].title` | `/knowledge-base/` |
| `knowledge-base.md` | `screenshots` | table | `blocks[screenshots].items[]` | `/knowledge-base/` |
| `generative-ai.md` | `metadata.title` | text | `metadata.title` | `/generative-ai/` |
| `generative-ai.md` | `metadata.description` | text | `metadata.description` | `/generative-ai/` |
| `generative-ai.md` | `hero.eyebrow` | text | `hero.eyebrow` | `/generative-ai/` |
| `generative-ai.md` | `hero.title` | text | `hero.title` | `/generative-ai/` |
| `generative-ai.md` | `hero.description` | text | `hero.description` | `/generative-ai/` |
| `generative-ai.md` | `hero.caption` | text | `hero.caption` | `/generative-ai/` |
| `generative-ai.md` | `hero.image-alt` | text | `hero.imageAlt` | `/generative-ai/` |
| `generative-ai.md` | `action.label` | text | `action.label` | `/generative-ai/` |
| `generative-ai.md` | `action.eyebrow` | text | `action.eyebrow` | `/generative-ai/` |
| `generative-ai.md` | `action.title` | text | `action.title` | `/generative-ai/` |
| `generative-ai.md` | `action.description` | text | `action.description` | `/generative-ai/` |
| `generative-ai.md` | `services.eyebrow` | text | `blocks[services].eyebrow` | `/generative-ai/` |
| `generative-ai.md` | `services.title` | text | `blocks[services].title` | `/generative-ai/` |
| `generative-ai.md` | `services.items` | lines | `blocks[services].items[]` | `/generative-ai/` |
| `generative-ai.md` | `flow.eyebrow` | text | `blocks[flow].eyebrow` | `/generative-ai/` |
| `generative-ai.md` | `flow.title` | text | `blocks[flow].title` | `/generative-ai/` |
| `generative-ai.md` | `flow.steps` | lines | `blocks[flow].steps[]` | `/generative-ai/` |
| `agi.md` | `metadata.title` | text | `metadata.title` | `/agi/` |
| `agi.md` | `metadata.description` | text | `metadata.description` | `/agi/` |
| `agi.md` | `hero.eyebrow` | text | `hero.eyebrow` | `/agi/` |
| `agi.md` | `hero.title` | text | `hero.title` | `/agi/` |
| `agi.md` | `hero.description` | text | `hero.description` | `/agi/` |
| `agi.md` | `action.label` | text | `action.label` | `/agi/` |
| `agi.md` | `capabilities.eyebrow` | text | `blocks[capabilities].eyebrow` | `/agi/` |
| `agi.md` | `capabilities.title` | text | `blocks[capabilities].title` | `/agi/` |
| `agi.md` | `capabilities.items` | lines | `blocks[capabilities].items[]` | `/agi/` |
| `agi.md` | `flow.eyebrow` | text | `blocks[flow].eyebrow` | `/agi/` |
| `agi.md` | `flow.title` | text | `blocks[flow].title` | `/agi/` |
| `agi.md` | `flow.description` | text | `blocks[flow].description` | `/agi/` |
| `agi.md` | `deployment.items` | lines | `blocks[deployment].items[]` | `/agi/` |
| `media.md` | `metadata.title` | text | `metadata.title` | `/media/` |
| `media.md` | `metadata.description` | text | `metadata.description` | `/media/` |
| `media.md` | `hero.eyebrow` | text | `hero.eyebrow` | `/media/` |
| `media.md` | `hero.title` | text | `hero.title` | `/media/` |
| `media.md` | `hero.description` | text | `hero.description` | `/media/` |
| `media.md` | `action.label` | text | `action.label` | `/media/` |
| `media.md` | `action.eyebrow` | text | `action.eyebrow` | `/media/` |
| `media.md` | `action.title` | text | `action.title` | `/media/` |
| `media.md` | `action.description` | text | `action.description` | `/media/` |
| `media.md` | `news.eyebrow` | text | `blocks[news].eyebrow` | `/media/` |
| `media.md` | `news.title` | text | `blocks[news].title` | `/media/` |
| `media.md` | `news.empty-title` | text | `blocks[news].empty.title` | `/media/` |
| `media.md` | `news.empty-description` | text | `blocks[news].empty.description` | `/media/` |
| `media.md` | `news.empty-action` | text | `blocks[news].empty.action.label` | `/media/` |
| `media.md` | `events.eyebrow` | text | `blocks[events].eyebrow` | `/media/` |
| `media.md` | `events.title` | text | `blocks[events].title` | `/media/` |
| `media.md` | `event.title` | text | `blocks[events].items[0].title` | `/media/` |
| `media.md` | `event.status` | text | `blocks[events].items[0].status` | `/media/` |
| `media.md` | `event.details` | table | `blocks[events].items[0].details[]` | `/media/` |
| `media.md` | `event.image-placeholder` | text | `blocks[events].items[0].imagePlaceholder` | `/media/` |
| `media.md` | `social.eyebrow` | text | `blocks[social].eyebrow` | `/media/` |
| `media.md` | `social.title` | text | `blocks[social].title` | `/media/` |
| `media.md` | `social.platform` | text | `blocks[social].platform` | `/media/` |
| `media.md` | `social.status` | text | `blocks[social].status` | `/media/` |
| `media.md` | `social.description` | text | `blocks[social].description` | `/media/` |
| `media.md` | `social.action` | text | `blocks[social].action` | `/media/` |
| `media.md` | `social.action-label` | text | `blocks[social].actionLabel` | `/media/` |
| `contact.md` | `metadata.title` | text | `metadata.title` | `/contact/` |
| `contact.md` | `metadata.description` | text | `metadata.description` | `/contact/` |
| `contact.md` | `hero.eyebrow` | text | `hero.eyebrow` | `/contact/` |
| `contact.md` | `hero.title` | text | `hero.title` | `/contact/` |
| `contact.md` | `hero.description` | text | `hero.description` | `/contact/` |
| `contact.md` | `action.label` | text | `action.label` | `/contact/` |
| `contact.md` | `action.eyebrow` | text | `action.eyebrow` | `/contact/` |
| `contact.md` | `action.title` | text | `action.title` | `/contact/` |
| `contact.md` | `action.description` | text | `action.description` | `/contact/` |
| `contact.md` | `contact.cards` | table | `blocks[contact].cards[]` | `/contact/` |
| `contact.md` | `consultation.eyebrow` | text | `blocks[consultation].eyebrow` | `/contact/` |
| `contact.md` | `consultation.title` | text | `blocks[consultation].title` | `/contact/` |
| `contact.md` | `consultation.steps` | table | `blocks[consultation].steps[]` | `/contact/` |
