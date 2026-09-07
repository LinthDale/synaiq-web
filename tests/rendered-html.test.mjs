import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the approved SynaiQ homepage content", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /讓企業知識/);
  assert.match(html, /到系統導入/);
  assert.match(html, /支援不同應用場景/);
  assert.match(html, /再串接系統完成工作/);
  assert.match(html, /到現場互動設備/);
  assert.match(html, /想先解決哪一段/);
  assert.match(html, /service@synaiq\.com/);
  assert.doesNotMatch(html, /四大解決方案|BUILT FOR THE REAL WORLD|畫面待補|已提供/);
});

test("every public route is driven by its own editable Markdown file", async () => {
  const routes = [
    ["home", "app/page.tsx"],
    ["about", "app/about/page.tsx"],
    ["products", "app/products/page.tsx"],
    ["wally", "app/wally/page.tsx"],
    ["knowledge-base", "app/knowledge-base/page.tsx"],
    ["generative-ai", "app/generative-ai/page.tsx"],
    ["agi", "app/agi/page.tsx"],
    ["media", "app/media/page.tsx"],
    ["contact", "app/contact/page.tsx"],
  ];

  for (const [name, routeFile] of routes) {
    const markdown = await readFile(new URL(`../content/pages/${name}.md`, import.meta.url), "utf8");
    const route = await readFile(new URL(`../${routeFile}`, import.meta.url), "utf8");
    assert.match(markdown, /^# /);
    assert.match(markdown, /^## /m);
    assert.match(route, new RegExp(`${name}\\.md\\?raw`));
    assert.match(route, /parsePageMarkdown/);
  }

  const helper = await readFile(new URL("../app/_content/markdown.tsx", import.meta.url), "utf8");
  assert.match(helper, /<br \/>/);
  assert.match(helper, /Missing Markdown content section/);
});

test("homepage source keeps the approved section structure", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const content = await readFile(new URL("../content/pages/home.md", import.meta.url), "utf8");

  for (const heading of ["品牌介紹", "我們的服務", "品牌產品", "技術應用", "產品畫面", "行動呼籲"]) {
    assert.match(content, new RegExp(heading));
  }
  assert.match(page, /serviceItems/);
  assert.match(page, /productItems/);
  assert.match(page, /home\.md\?raw/);
  assert.match(page, /parsePageMarkdown/);
  assert.match(page, /useGSAP/);
  assert.match(page, /ScrollTrigger/);
  assert.match(page, /prefers-reduced-motion/);
  assert.doesNotMatch(page, /requestAnimationFrame/);
  assert.match(page, /sceneIsHidden/);
  assert.match(page, /from "next\/image"/);
  assert.match(page, /synaiq-logo-s\.webp/);
  assert.match(page, /knowledge-base\.png/);
  assert.match(page, /media-factory\.png/);
  assert.match(page, /wally-1\.png/);
  assert.match(page, /wally-mini\.png/);
  for (const path of ["/knowledge-base", "/generative-ai", "/agi", "/wally"]) {
    assert.match(content, new RegExp(`\\| ${path.replace("/", "\\/")} \\|`));
  }
  assert.match(page, /className="scene-nav"/);
  assert.match(page, /<span>\{label\}<\/span>/);
  assert.match(page, /canvas-editor-toggle/);
  assert.match(page, /contentEditable/);
  assert.match(page, /synaiq-home-canvas-overrides/);
  assert.doesNotMatch(page, /orbit-core|>Q</);
  assert.doesNotMatch(page, /solutions-section|solution-grid|四大解決方案/);
  assert.doesNotMatch(page, /Wally 系列首頁顯示方式/);
});

test("brand Medium font is embedded from the confirmed project asset", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const font = await stat(new URL("../public/fonts/NotoSansCJKtc-Medium.otf", import.meta.url));

  assert.equal(font.size, 16_508_576);
  assert.match(styles, /@font-face\{font-family:"SynaiQ Noto Sans CJK TC"/);
  assert.match(styles, /url\("\/fonts\/NotoSansCJKtc-Medium\.otf"\) format\("opentype"\)/);
  assert.match(styles, /font-weight:500/);
  assert.match(styles, /font-display:swap/);
  assert.match(styles, /--font-brand:"SynaiQ Noto Sans CJK TC"/);
});

test("site-wide navigation points to working independent pages", async () => {
  const page = await readFile(new URL("../app/_components/SiteHeader.tsx", import.meta.url), "utf8");
  const content = await readFile(new URL("../content/pages/site.md", import.meta.url), "utf8");
  assert.match(page, /className=\{`menu-toggle/);
  assert.match(page, /aria-controls="mobile-navigation"/);
  assert.match(page, /setIsMenuOpen/);
  assert.match(page, /site\.md\?raw/);
  for (const path of ["/about", "/products", "/media", "/contact"]) {
    assert.match(content, new RegExp(`\\| ${path.replace("/", "\\/")} \\|`));
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render successfully`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  }
});

test("products page presents four complete, brand-aligned product paths", async () => {
  const page = await readFile(new URL("../app/products/page.tsx", import.meta.url), "utf8");
  const content = await readFile(new URL("../content/pages/products.md", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const response = await render("/products");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(page, /pageClassName="products-page"/);
  assert.match(page, /aria-label="選擇產品"/);
  assert.match(page, /product-card-action/);
  assert.doesNotMatch(page, /<article className="product-page-card"/);
  for (const path of ["/knowledge-base", "/generative-ai", "/agi", "/wally"]) {
    assert.match(content, new RegExp(path.replace("/", "\\/")));
  }
  assert.ok(content.indexOf("企業知識庫") < content.indexOf("Wally 系列"));
  assert.match(styles, /\.products-page \.product-page-grid\{[^}]*grid-template-columns:repeat\(2/);
  assert.match(styles, /\.products-page \.subpage-hero h1[^}]*font-family:var\(--font-brand\)/);
  for (const label of ["企業知識庫", "生成式 AI 服務", "AGI", "Wally 系列"]) assert.match(html, new RegExp(label));
});

test("product, knowledge, generative AI, team and media pages connect confirmed assets", async () => {
  const wallyPage = await readFile(new URL("../app/wally/page.tsx", import.meta.url), "utf8");
  const aboutPage = await readFile(new URL("../app/about/page.tsx", import.meta.url), "utf8");
  const knowledgePage = await readFile(new URL("../app/knowledge-base/page.tsx", import.meta.url), "utf8");
  const generativePage = await readFile(new URL("../app/generative-ai/page.tsx", import.meta.url), "utf8");
  const mediaPage = await readFile(new URL("../app/media/page.tsx", import.meta.url), "utf8");
  const mediaContent = await readFile(new URL("../content/pages/media.md", import.meta.url), "utf8");
  const imagePaths = [
    "public/brand/wally-1.png",
    "public/brand/wally/wally-1-plus.png",
    "public/brand/wally/wally-2.png",
    "public/brand/wally-2-plus.png",
    "public/brand/wally-mini.png",
    "public/brand/wally/wally-series.png",
    "public/brand/wally/wally-2-hero.png",
    "public/brand/wally-2-cutout.png",
    "public/brand/team/wilson-web-1.jpg",
    "public/brand/team/sunny-web-1.1.jpg",
    "public/brand/team/leff-web-1.jpg",
    "public/brand/team/lou-web-1.jpg",
    "public/brand/team/dale-web-1.jpg",
    "public/brand/team/daniel-web-1.jpg",
    "public/brand/synaiq-logo-s.webp",
    "public/brand/duoduo-cutout.png",
    "public/brand/knowledge-base.png",
    "public/brand/knowledge-workflow.jpg",
    "public/brand/media-factory.png",
  ];

  for (const imagePath of imagePaths) {
    await stat(new URL(`../${imagePath}`, import.meta.url));
  }
  for (const imagePath of imagePaths.slice(0, 5)) assert.ok(wallyPage.includes(`/${imagePath.slice("public/".length)}`));
  assert.ok(wallyPage.includes("/brand/wally/wally-series.png"));
  for (const imagePath of imagePaths.slice(8, 14)) assert.ok(aboutPage.includes(`/${imagePath.slice("public/".length)}`));
  assert.match(knowledgePage, /knowledge-base\.png|knowledge-workflow\.jpg/);
  assert.match(generativePage, /media-factory\.png/);
  assert.match(mediaContent, /台灣國際淨零永續展/);
  assert.match(mediaPage, /https:\/\/www\.instagram\.com\/synaiq\.ai\//);
  assert.doesNotMatch(mediaPage, /youtube|facebook|影音刊物/i);

  const [wallyResponse, aboutResponse, knowledgeResponse, generativeResponse, mediaResponse] = await Promise.all([render("/wally"), render("/about"), render("/knowledge-base"), render("/generative-ai"), render("/media")]);
  assert.equal(wallyResponse.status, 200);
  assert.equal(aboutResponse.status, 200);
  assert.equal(knowledgeResponse.status, 200);
  assert.equal(generativeResponse.status, 200);
  assert.equal(mediaResponse.status, 200);
  assert.match(await wallyResponse.text(), /Wally 1 Plus|wally-1-plus/);
  assert.match(await aboutResponse.text(), /LEADERSHIP TEAM|TECHNICAL TEAM|wilson-web-1/);
  assert.match(await knowledgeResponse.text(), /企業知識庫介面|knowledge-base/);
  assert.match(await generativeResponse.text(), /服飾業應用成果|media-factory/);
  assert.match(await mediaResponse.text(), /新聞集錦|活動訊息|Instagram/);
});

test("approved P1/P2 route hierarchy and language changes are rendered", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const knowledgePage = await readFile(new URL("../app/knowledge-base/page.tsx", import.meta.url), "utf8");
  const wallyPage = await readFile(new URL("../app/wally/page.tsx", import.meta.url), "utf8");
  const mediaPage = await readFile(new URL("../app/media/page.tsx", import.meta.url), "utf8");
  const contactPage = await readFile(new URL("../app/contact/page.tsx", import.meta.url), "utf8");
  const homepage = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const knowledgeContent = await readFile(new URL("../content/pages/knowledge-base.md", import.meta.url), "utf8");
  const generativeContent = await readFile(new URL("../content/pages/generative-ai.md", import.meta.url), "utf8");
  const wallyContent = await readFile(new URL("../content/pages/wally.md", import.meta.url), "utf8");
  const mediaContent = await readFile(new URL("../content/pages/media.md", import.meta.url), "utf8");
  const contactContent = await readFile(new URL("../content/pages/contact.md", import.meta.url), "utf8");
  const homeContent = await readFile(new URL("../content/pages/home.md", import.meta.url), "utf8");

  assert.doesNotMatch(styles, /Georgia|Times New Roman/);
  assert.match(knowledgePage, /subpage-hero-evidence|media-frame-evidence/);
  assert.match(knowledgeContent, /討論知識庫需求|START WITH YOUR DOCUMENTS/);
  assert.match(generativeContent, /討論生成流程|START WITH ONE CONTENT FLOW/);
  assert.match(wallyPage, /wally-selection-grid|model-comparison/);
  assert.match(wallyContent, /Wally 2 Plus/);
  assert.match(wallyPage, /wally-hero-visual|scenario-gallery-wide/);
  assert.match(wallyContent, /Wally 系列情境展示|supporting\.photos/);
  assert.doesNotMatch(wallyPage, /scenario-gallery-placeholder|scenario-gallery-card/);
  assert.doesNotMatch(wallyContent, /情境照片待補/);
  assert.match(mediaPage, /EmptyState|empty-state/);
  assert.match(mediaContent, /目前沒有可公開的新聞/);
  assert.match(contactContent, /CONSULTATION FLOW|資料來源|預期成果/);
  assert.match(homepage, /mobile-scene-nav|MarkdownText/);
  assert.match(homeContent, /先找資料再回答|模型上下文協定/);
  assert.doesNotMatch(contactPage, /LET&amp;apos;S/);

  for (const [path, title] of [["/knowledge-base", "企業知識庫｜SynaiQ"], ["/wally", "Wally 系列｜SynaiQ"], ["/media", "媒體中心｜SynaiQ"], ["/contact", "聯絡我們｜SynaiQ"]]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title}</title>`));
    if (path === "/wally") {
      assert.doesNotMatch(html, /Wally 系列總覽｜五型號同頁比較/);
      assert.match(html, /Wally 系列情境展示/);
      assert.doesNotMatch(html, /情境照片待補|Wally 系列總覽｜五型號同頁比較/);
    }
  }
});
