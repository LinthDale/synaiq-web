"use client";

import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import SiteHeader from "./_components/SiteHeader";
import homeSource from "@/content/pages/home.md?raw";
import siteSource from "@/content/pages/site.md?raw";
import { parsePageMarkdown } from "./_content/markdown";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const content = parsePageMarkdown(homeSource);
const siteContent = parsePageMarkdown(siteSource);
const labels = content.lines("navigation.labels");
const sceneIds = ["brand", "services", "products", "technology", "experience", "action"];
const serviceItems = content.lines("services.items");
const productItems = content.table("products.items");
const abilities = content.table("technology.abilities");
const evidenceItems = content.lines("experience.items");
type DocumentIconKind = "pdf" | "word" | "excel" | "image" | "scan";
const documentItems = content.table("services.documents").map((item) => ({ ...item, kind: item.kind as DocumentIconKind }));

type CanvasOverride = { x: number; y: number; fontSize?: number; value?: string };
type CanvasOverrides = Record<string, CanvasOverride>;

const canvasLabels: Record<string, string> = {
  "hero.title.primary": "品牌標題第一行",
  "hero.title.secondary": "品牌標題第二行",
  "hero.description": "品牌介紹說明",
  "hero.primary-action": "主要行動按鈕",
  "hero.secondary-action": "次要連結",
  "hero.visual": "品牌標誌視覺",
  "services.title": "服務標題",
  "services.description": "服務說明",
  "services.items.0": "服務項目一",
  "services.items.1": "服務項目二",
  "services.items.2": "服務項目三",
  "services.items.3": "服務項目四",
  "services.items.4": "服務項目五",
  "services.documents": "文件資料雲",
  "services.target": "資料整合目標",
  "products.title": "產品標題",
  "products.description": "產品說明",
  "products.0": "企業知識庫產品卡",
  "products.1": "生成式 AI 產品卡",
  "products.2": "AGI 產品卡",
  "products.3": "Wally 系列產品卡",
  "products.0.name": "企業知識庫名稱",
  "products.0.description": "企業知識庫說明",
  "products.1.name": "生成式 AI 名稱",
  "products.1.description": "生成式 AI 說明",
  "products.2.name": "AGI 名稱",
  "products.2.description": "AGI 說明",
  "products.3.name": "Wally 系列名稱",
  "products.3.description": "Wally 系列說明",
  "technology.title": "技術應用標題",
  "technology.RAG": "RAG 能力卡",
  "technology.REASON": "REASON 能力卡",
  "technology.MCP": "MCP 能力卡",
  "technology.AGENT": "AGENT 能力卡",
  "technology.RAG.title": "RAG 能力名稱",
  "technology.RAG.description": "RAG 能力說明",
  "technology.REASON.title": "REASON 能力名稱",
  "technology.REASON.description": "REASON 能力說明",
  "technology.MCP.title": "MCP 能力名稱",
  "technology.MCP.description": "MCP 能力說明",
  "technology.AGENT.title": "AGENT 能力名稱",
  "technology.AGENT.description": "AGENT 能力說明",
  "experience.title": "產品畫面標題",
  "experience.description": "產品畫面說明",
  "experience.items.0": "產品畫面項目一",
  "experience.items.1": "產品畫面項目二",
  "experience.items.2": "產品畫面項目三",
  "experience.knowledge-caption": "企業知識庫畫面標題",
  "experience.generative-caption": "生成式 AI 畫面標題",
  "experience.knowledge": "企業知識庫畫面",
  "experience.generative": "生成式 AI 畫面",
  "experience.devices": "Wally 產品縮圖",
  "action.content": "行動呼籲內容",
  "action.title": "行動呼籲標題",
  "action.description": "行動呼籲說明",
  "action.label": "行動呼籲按鈕",
  "contact.title": "聯絡標題",
  "contact.description": "聯絡說明",
  "contact.card.0.eyebrow": "Email 聯絡卡標籤",
  "contact.card.0.title": "Email 聯絡卡內容",
  "contact.card.1.eyebrow": "電話聯絡卡標籤",
  "contact.card.1.title": "電話聯絡卡內容",
  "contact.card.2.eyebrow": "公司地址卡標籤",
  "contact.card.2.title": "公司地址卡內容",
};

const canvasTextIds = new Set(Object.keys(canvasLabels).filter((id) => ![
  "hero.visual", "services.documents", "products.0", "products.1", "products.2", "products.3",
  "technology.RAG", "technology.REASON", "technology.MCP", "technology.AGENT",
  "experience.knowledge", "experience.generative", "experience.devices", "action.content",
].includes(id)));
const isCanvasTextId = (id: string) => canvasTextIds.has(id) || /\.(name|description|title)$/.test(id);

const canvasStyle = (override?: CanvasOverride): CSSProperties | undefined => {
  if (!override) return undefined;
  return {
    ["--canvas-x" as string]: `${override.x}px`,
    ["--canvas-y" as string]: `${override.y}px`,
    ...(override.fontSize ? { fontSize: `${override.fontSize}px` } : {}),
  } as CSSProperties;
};

type CanvasTextProps = {
  id: string;
  label: string;
  value: string;
  editor: boolean;
  editing: boolean;
  selected?: boolean;
  style?: CSSProperties;
  as?: ElementType;
  className?: string;
  onSelect: (id: string) => void;
  onStartEdit: (id: string) => void;
  onInput: (id: string, value: string) => void;
  onCommit: (id: string) => void;
  onPointerDown: (id: string, event: ReactPointerEvent<HTMLElement>) => void;
};

function CanvasText({
  id,
  label,
  value,
  editor,
  editing,
  selected,
  style,
  as: Element = "span",
  className,
  onSelect,
  onStartEdit,
  onInput,
  onCommit,
  onPointerDown,
}: CanvasTextProps) {
  const editorClassName = [className, "canvas-text-value", editor ? "canvas-editable-text" : undefined, editing ? "canvas-editing-text" : undefined]
    .filter(Boolean)
    .join(" ");
  const targetProps = {
    "data-canvas-id": editor ? id : undefined,
    "data-canvas-label": editor ? label : undefined,
    "data-canvas-selected": editor && selected ? "true" : undefined,
    className: editorClassName || undefined,
    style: editor ? style : undefined,
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      onSelect(id);
      if (editor) event.preventDefault();
    },
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => onPointerDown(id, event),
    onDoubleClick: (event: ReactMouseEvent<HTMLElement>) => {
      if (!editor) return;
      event.preventDefault();
      onStartEdit(id);
    },
  };

  if (editor && editing) {
    return (
      <Element
        {...targetProps}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={`編輯${label}`}
        onInput={(event) => onInput(id, event.currentTarget.textContent ?? "")}
        onBlur={() => onCommit(id)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      >
        {value}
      </Element>
    );
  }

  return <Element {...targetProps}>{value}</Element>;
}

function DocumentIcon({ kind }: { kind: DocumentIconKind }) {
  return (
    <svg className={`document-icon document-icon-${kind}`} viewBox="0 0 64 76" aria-hidden="true">
      <path className="document-icon-page" d="M13 3h25l13 13v57H13z" />
      <path className="document-icon-fold" d="M38 3v14h13" />
      {kind === "word" && (
        <>
          <rect className="document-icon-badge" x="18" y="29" width="29" height="26" rx="3" />
          <path className="document-icon-mark" d="M22 35l3 14 4-10 4 10 4-14" />
        </>
      )}
      {kind === "excel" && (
        <>
          <rect className="document-icon-badge" x="18" y="29" width="29" height="26" rx="3" />
          <path className="document-icon-mark" d="M24 35l6 7-6 7m13-14l-6 7 6 7M21 42h24" />
        </>
      )}
      {kind === "image" && (
        <>
          <rect className="document-icon-badge" x="18" y="29" width="29" height="26" rx="3" />
          <circle className="document-icon-mark-fill" cx="39" cy="36" r="3" />
          <path className="document-icon-mark" d="M22 50l8-9 5 5 4-4 6 8" />
        </>
      )}
      {kind === "pdf" && (
        <>
          <rect className="document-icon-badge" x="18" y="29" width="29" height="26" rx="3" />
          <path className="document-icon-mark" d="M24 49V35h5c4 0 5 7 0 7h-5m11-7h7m-7 0v14m0-7h6" />
        </>
      )}
      {kind === "scan" && (
        <path className="document-icon-mark" d="M23 38v-5h5m8 0h5v5m0 8v5h-5m-8 0h-5v-5" />
      )}
    </svg>
  );
}

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const settledSceneProgress = (scene: number, sceneCount: number) =>
  scene === 0 ? 0.01 : Math.min(0.999, (scene + 0.38) / sceneCount);

export default function Home() {
  const storyRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [isDesktopStory, setIsDesktopStory] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<CanvasOverrides>({});
  const overridesLoadedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editorFromUrl = params.get("edit") === "1";
    let savedOverrides: CanvasOverrides | null = null;
    try {
      const saved = window.localStorage.getItem("synaiq-home-canvas-overrides");
      if (saved) {
        const parsed = JSON.parse(saved) as CanvasOverrides;
        if (parsed && typeof parsed === "object") savedOverrides = parsed;
      }
    } catch {
      // Ignore unavailable or malformed local preview data.
    }
    const editorTimer = window.setTimeout(() => {
      if (savedOverrides) setOverrides(savedOverrides);
      overridesLoadedRef.current = true;
      setIsEditor(editorFromUrl);
    }, 0);
    return () => window.clearTimeout(editorTimer);
  }, []);

  useEffect(() => {
    if (!overridesLoadedRef.current) return;
    try {
      window.localStorage.setItem("synaiq-home-canvas-overrides", JSON.stringify(overrides));
    } catch {
      // The editor remains usable when browser storage is unavailable.
    }
  }, [overrides]);

  const valueFor = (id: string, fallback: string) => overrides[id]?.value ?? fallback;
  const styleFor = (id: string) => canvasStyle(overrides[id]);

  const updateOverride = (id: string, patch: Partial<CanvasOverride>) => {
    setOverrides((current) => ({
      ...current,
      [id]: {
        x: current[id]?.x ?? 0,
        y: current[id]?.y ?? 0,
        ...current[id],
        ...patch,
      },
    }));
  };

  const beginDrag = (id: string, event: ReactPointerEvent<HTMLElement>) => {
    if (!isEditor || editingId === id) return;
    const nestedTarget = event.target instanceof HTMLElement ? event.target.closest("[data-canvas-id]") : null;
    if (nestedTarget && nestedTarget !== event.currentTarget) return;
    event.preventDefault();
    setSelectedId(id);
    const origin = overrides[id] ?? { x: 0, y: 0 };
    const startX = event.clientX;
    const startY = event.clientY;
    const handleMove = (moveEvent: PointerEvent) => {
      updateOverride(id, {
        x: Math.round(origin.x + moveEvent.clientX - startX),
        y: Math.round(origin.y + moveEvent.clientY - startY),
      });
    };
    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
  };

  const canvasProps = (id: string, label = canvasLabels[id]) => ({
    "data-canvas-id": isEditor ? id : undefined,
    "data-canvas-label": isEditor ? label : undefined,
    "data-canvas-selected": isEditor && selectedId === id ? "true" : undefined,
    style: isEditor ? styleFor(id) : undefined,
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      if (!isEditor) return;
      const nestedTarget = event.target instanceof HTMLElement ? event.target.closest("[data-canvas-id]") : null;
      if (nestedTarget && nestedTarget !== event.currentTarget) return;
      event.preventDefault();
      setSelectedId(id);
    },
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => beginDrag(id, event),
  });

  const startEditing = (id: string) => {
    setSelectedId(id);
    setEditingId(id);
  };

  const resetSelected = () => {
    if (!selectedId) return;
    setOverrides((current) => {
      const next = { ...current };
      delete next[selectedId];
      return next;
    });
    setEditingId(null);
  };

  const resetAll = () => {
    setOverrides({});
    setSelectedId(null);
    setEditingId(null);
  };

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const syncStoryMode = () => setIsDesktopStory(desktopQuery.matches);
    syncStoryMode();
    desktopQuery.addEventListener("change", syncStoryMode);
    return () => desktopQuery.removeEventListener("change", syncStoryMode);
  }, []);

  useGSAP(() => {
    const story = storyRef.current;
    const progressElement = progressRef.current;
    if (!story || !progressElement || !isDesktopStory) return;

    const scenes = gsap.utils.toArray<HTMLElement>(story.querySelectorAll(".scene"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setProgress = gsap.quickSetter(progressElement, "scaleX");
    const updateStoryState = (progress: number) => {
      setProgress(progress);
      const nextActive = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
    };

    story.classList.add("has-gsap-motion");
    gsap.set(scenes, { autoAlpha: 0, yPercent: 4, scale: 0.988, pointerEvents: "none" });
    gsap.set(scenes[0], { autoAlpha: 1, yPercent: 0, scale: 1, pointerEvents: "auto" });

    if (reducedMotion) {
      const reducedTrigger = ScrollTrigger.create({
        trigger: story,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const nextActive = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length));
          if (nextActive !== activeRef.current) {
            gsap.set(scenes, { autoAlpha: 0, yPercent: 0, scale: 1, pointerEvents: "none" });
            gsap.set(scenes[nextActive], { autoAlpha: 1, pointerEvents: "auto" });
          }
          updateStoryState(self.progress);
        },
      });
      updateStoryState(reducedTrigger.progress);
      return () => story.classList.remove("has-gsap-motion");
    }

    const playhead = { progress: 0 };
    const timeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      scrollTrigger: {
        trigger: story,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        snap: {
          snapTo: scenes.map((_, scene) => settledSceneProgress(scene, scenes.length)),
          duration: { min: 0.18, max: 0.38 },
          delay: 0.06,
          ease: "power2.out",
          directional: true,
          inertia: false,
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => updateStoryState(self.progress),
      },
    });

    timeline.to(playhead, { progress: 1, duration: scenes.length, ease: "none" }, 0);
    if (ambientRef.current) {
      timeline.to(ambientRef.current, { y: 90, x: -36, scale: 1.08, duration: scenes.length, ease: "none" }, 0);
    }

    scenes.slice(1).forEach((scene, index) => {
      const sceneNumber = index + 1;
      const previousScene = scenes[sceneNumber - 1];
      timeline
        .to(previousScene, {
          autoAlpha: 0,
          yPercent: -3,
          scale: 0.995,
          clipPath: "inset(0 0 8% 0)",
          pointerEvents: "none",
          duration: 0.24,
          ease: "power2.in",
        }, sceneNumber - 0.16)
        .fromTo(scene, {
          autoAlpha: 0,
          yPercent: 4,
          scale: 0.988,
          clipPath: "inset(9% 0 0 0)",
        }, {
          autoAlpha: 1,
          yPercent: 0,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          pointerEvents: "auto",
          duration: 0.38,
          ease: "power3.out",
          immediateRender: false,
        }, sceneNumber - 0.04);
    });

    timeline.fromTo(".document-card", {
      x: (index) => index % 2 ? 150 : -150,
      y: (index) => (index - 2) * 62,
      autoAlpha: 0,
    }, {
      x: 0,
      y: 0,
      autoAlpha: 1,
      stagger: 0.04,
      duration: 0.42,
      ease: "power3.out",
    }, 0.82);
    timeline.fromTo(".product-entry", { autoAlpha: 0, y: 22, scale: 0.97 }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      stagger: 0.045,
      duration: 0.32,
      ease: "power3.out",
    }, 1.84);
    timeline.fromTo(".capability-card", { autoAlpha: 0, y: 28 }, {
      autoAlpha: 1,
      y: 0,
      stagger: 0.055,
      duration: 0.34,
      ease: "power3.out",
    }, 2.82);
    timeline.fromTo(".evidence-frame", { autoAlpha: 0, yPercent: 10, scale: 0.96 }, {
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      stagger: 0.08,
      duration: 0.48,
      ease: "power3.out",
    }, 3.78);
    timeline.fromTo(".product-halo", { autoAlpha: 0, scale: 0.78 }, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.55,
      ease: "power2.out",
    }, 3.72);
    updateStoryState(timeline.scrollTrigger?.progress ?? 0);
    return () => story.classList.remove("has-gsap-motion");
  }, { scope: storyRef, dependencies: [isDesktopStory], revertOnUpdate: true });

  const jump = (scene: number) => {
    const story = storyRef.current;
    const desktopStory = window.matchMedia("(min-width: 901px)").matches;
    if (!desktopStory) {
      document.getElementById(sceneIds[scene])?.scrollIntoView({ behavior: scrollBehavior() });
    } else if (story) {
      const settledProgress = settledSceneProgress(scene, sceneIds.length);
      window.scrollTo({
        top: story.offsetTop + (story.offsetHeight - window.innerHeight) * settledProgress,
        behavior: scrollBehavior(),
      });
    }
  };

  const contactLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: scrollBehavior() });
  };

  const sceneIsHidden = (scene: number) => (isDesktopStory ? active !== scene : undefined);
  const editableTextProps = (id: string, fallback: string, as?: ElementType, className?: string) => ({
    id,
    label: canvasLabels[id] ?? id,
    value: valueFor(id, fallback),
    editor: isEditor,
    editing: editingId === id,
    selected: selectedId === id,
    style: styleFor(id),
    as,
    className,
    onSelect: setSelectedId,
    onStartEdit: startEditing,
    onInput: (targetId: string, value: string) => updateOverride(targetId, { value }),
    onCommit: () => setEditingId(null),
    onPointerDown: beginDrag,
  });

  const selectedOverride = selectedId ? overrides[selectedId] ?? { x: 0, y: 0 } : { x: 0, y: 0 };
  const selectedLabel = selectedId ? canvasLabels[selectedId] ?? selectedId : "尚未選取元件";
  const updateSelectedNumber = (key: "x" | "y" | "fontSize", value: string) => {
    if (!selectedId) return;
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;
    updateOverride(selectedId, { [key]: Math.round(numericValue) });
  };

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={isEditor ? "canvas-editor-active" : undefined}>
      <button
        className="canvas-editor-toggle"
        type="button"
        aria-pressed={isEditor}
        onClick={() => {
          setIsEditor((open) => !open);
          setEditingId(null);
        }}
      >
        {isEditor ? "關閉畫布編輯" : "畫布編輯"}
      </button>
      {isEditor ? (
        <aside className="canvas-editor-panel" aria-label="首頁畫布編輯器">
          <div className="canvas-editor-panel-heading">
            <div>
              <span className="canvas-editor-kicker">LOCAL CANVAS</span>
              <strong>畫布編輯</strong>
            </div>
            <button type="button" aria-label="關閉畫布編輯器" onClick={() => { setIsEditor(false); setEditingId(null); }}>×</button>
          </div>
          <p className="canvas-editor-help">點選元件後拖曳調整位置；文字元件可雙擊直接編輯。</p>
          <div className="canvas-editor-selection" aria-live="polite">
            <span>目前選取</span>
            <strong>{selectedLabel}</strong>
          </div>
          <div className="canvas-editor-fields">
            <label>水平位移（px）<input type="number" value={selectedOverride.x} disabled={!selectedId} onChange={(event) => updateSelectedNumber("x", event.target.value)} /></label>
            <label>垂直位移（px）<input type="number" value={selectedOverride.y} disabled={!selectedId} onChange={(event) => updateSelectedNumber("y", event.target.value)} /></label>
            {selectedId && isCanvasTextId(selectedId) ? <label>文字大小（px）<input type="number" min="10" max="120" value={selectedOverride.fontSize ?? ""} placeholder="原始大小" onChange={(event) => updateSelectedNumber("fontSize", event.target.value)} /></label> : null}
          </div>
          <div className="canvas-editor-actions">
            <button type="button" disabled={!selectedId} onClick={resetSelected}>重設本項</button>
            <button type="button" onClick={resetAll}>全部重設</button>
          </div>
          <small>調整會自動儲存在此瀏覽器。</small>
        </aside>
      ) : null}

      <section id="story" ref={storyRef} className="scroll-story" aria-label="SynaiQ 首頁內容">
        <div className="sticky-stage" id="top">
          <div ref={ambientRef} className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <div className="story-progress" aria-hidden="true"><span ref={progressRef} /></div>
          <nav className="mobile-scene-nav" aria-label="首頁內容定位">
            {labels.map((label, i) => <a href={`#${sceneIds[i]}`} key={label}>{label}</a>)}
          </nav>

          <section id="brand" className={`scene scene-hero ${active === 0 ? "is-active" : ""}`} aria-hidden={sceneIsHidden(0)} inert={sceneIsHidden(0)}>
            <div className="scene-hero-copy">
              <h1>
                <CanvasText {...editableTextProps("hero.title.primary", content.lines("hero.title")[0])} />
                <CanvasText {...editableTextProps("hero.title.secondary", content.lines("hero.title").slice(1).join("\n"))} />
              </h1>
              <p><CanvasText {...editableTextProps("hero.description", content.text("hero.description"))} /></p>
              <div className="hero-actions">
                <a className="primary-button" href="#services" onClick={(event) => { event.preventDefault(); jump(1); }}><CanvasText {...editableTextProps("hero.primary-action", content.text("hero.primary-action"))} /></a>
                <a className="text-link" href="/about"><CanvasText {...editableTextProps("hero.secondary-action", content.text("hero.secondary-action"))} /></a>
              </div>
            </div>
            <div className="hero-logo-visual" {...canvasProps("hero.visual")}>
              <div className="hero-logo-halo" aria-hidden="true" />
              <Image className="hero-brand-logo" src="/brand/synaiq-logo-s.webp" alt={content.text("hero.image-alt")} fill priority sizes="(max-width: 767px) 88vw, (max-width: 1200px) 46vw, 680px" style={{ objectFit: "contain", objectPosition: "center" }} />
            </div>
            <div className="scroll-hint" aria-hidden="true"><span />{content.text("hero.scroll-hint")}</div>
          </section>

          <section id="services" className={`scene scene-split scene-data ${active === 1 ? "is-active" : ""}`} aria-hidden={sceneIsHidden(1)} inert={sceneIsHidden(1)}>
            <div className="scene-copy">
              <h2><CanvasText {...editableTextProps("services.title", content.text("services.title"))} /></h2>
              <p><CanvasText {...editableTextProps("services.description", content.text("services.description"))} /></p>
              <ul className="service-list">
                {serviceItems.map((item, index) => <li key={item}><CanvasText {...editableTextProps(`services.items.${index}`, item)} /></li>)}
              </ul>
            </div>
            <div className="document-cloud" aria-hidden={!isEditor} {...canvasProps("services.documents")}>
              {documentItems.map((item, i) => <div className={`document-card document-${i + 1}`} key={item.kind} aria-label={item.label}><DocumentIcon kind={item.kind} /><i /><i /><i /></div>)}
              <div className="ingestion-target"><CanvasText {...editableTextProps("services.target", content.text("services.target"))} /></div>
            </div>
          </section>

          <section id="products" className={`scene scene-split scene-core ${active === 2 ? "is-active" : ""}`} aria-hidden={sceneIsHidden(2)} inert={sceneIsHidden(2)}>
            <div className="product-entry-grid" aria-label="SynaiQ 產品入口">
              {productItems.map((item, index) => (
                <a className="product-entry" href={item.href} key={item.name} {...canvasProps(`products.${index}`, `${item.name}產品卡`)}>
                  <strong><CanvasText {...editableTextProps(`products.${index}.name`, item.name)} /></strong>
                  <span><CanvasText {...editableTextProps(`products.${index}.description`, item.description)} /></span>
                  <small>{content.text("products.item-action")}</small>
                </a>
              ))}
            </div>
            <div className="scene-copy"><h2><CanvasText {...editableTextProps("products.title", content.text("products.title"))} /></h2><p><CanvasText {...editableTextProps("products.description", content.text("products.description"))} /></p></div>
          </section>

          <section id="technology" className={`scene scene-reason ${active === 3 ? "is-active" : ""}`} aria-hidden={sceneIsHidden(3)} inert={sceneIsHidden(3)}>
            <div className="scene-heading"><h2><CanvasText {...editableTextProps("technology.title", content.text("technology.title"))} /></h2></div>
            <div className="capability-flow">{abilities.map((ability) => <article className="capability-card" key={ability.code} {...canvasProps(`technology.${ability.code}`, `${ability.code}能力卡`)}><div className="capability-code">{ability.code}</div><strong><CanvasText {...editableTextProps(`technology.${ability.code}.title`, ability.title)} /></strong><p><CanvasText {...editableTextProps(`technology.${ability.code}.description`, ability.description)} /></p><span className="flow-dot" /></article>)}</div>
          </section>

          <section id="experience" className={`scene scene-split scene-products ${active === 4 ? "is-active" : ""}`} aria-hidden={sceneIsHidden(4)} inert={sceneIsHidden(4)}>
            <div className="evidence-stage">
              <div className="product-halo" aria-hidden="true" />
              <figure className="evidence-frame evidence-primary media-frame media-frame-evidence" {...canvasProps("experience.knowledge")}>
                <div className="evidence-media"><Image src="/brand/knowledge-base.png" alt={content.text("experience.knowledge-alt")} fill sizes="(max-width: 900px) 88vw, 44vw" /></div>
                <figcaption><CanvasText {...editableTextProps("experience.knowledge-caption", content.text("experience.knowledge-caption"))} /></figcaption>
              </figure>
              <figure className="evidence-frame evidence-secondary media-frame media-frame-evidence" {...canvasProps("experience.generative")}>
                <div className="evidence-media"><Image src="/brand/media-factory.png" alt={content.text("experience.generative-alt")} fill sizes="(max-width: 900px) 62vw, 24vw" /></div>
                <figcaption><CanvasText {...editableTextProps("experience.generative-caption", content.text("experience.generative-caption"))} /></figcaption>
              </figure>
              <div className="evidence-devices" aria-label={content.text("experience.devices-label")} {...canvasProps("experience.devices")}>
                <div className="evidence-device media-frame media-frame-product"><Image src="/brand/wally-1.png" alt={content.text("experience.wally-1-alt")} fill sizes="96px" /></div>
                <div className="evidence-device media-frame media-frame-product"><Image src="/brand/wally-mini.png" alt={content.text("experience.wally-mini-alt")} fill sizes="96px" /></div>
              </div>
            </div>
            <div className="scene-copy"><h2><CanvasText {...editableTextProps("experience.title", content.text("experience.title"))} /></h2><div className="evidence-list">{evidenceItems.map((label, index) => <span key={label}><CanvasText {...editableTextProps(`experience.items.${index}`, label)} /></span>)}</div><p><CanvasText {...editableTextProps("experience.description", content.text("experience.description"))} /></p></div>
          </section>

          <section id="action" className={`scene scene-cta ${active === 5 ? "is-active" : ""}`} aria-hidden={sceneIsHidden(5)} inert={sceneIsHidden(5)}>
            <div className="cta-content" {...canvasProps("action.content")}><h2><CanvasText {...editableTextProps("action.title", content.text("action.title"))} /></h2><p><CanvasText {...editableTextProps("action.description", content.text("action.description"))} /></p><a className="primary-button" href="#contact" onClick={contactLink}><CanvasText {...editableTextProps("action.label", content.text("action.label"))} /></a></div>
          </section>

          <nav className="scene-nav" aria-label="首頁內容進度">{labels.map((label, i) => <button type="button" key={label} className={i === active ? "active" : ""} aria-current={i === active ? "step" : undefined} onClick={() => jump(i)}><span>{label}</span></button>)}</nav>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-copy"><h2><CanvasText {...editableTextProps("contact.title", content.text("contact.title"))} /></h2><p><CanvasText {...editableTextProps("contact.description", content.text("contact.description"))} /></p></div>
        <div className="contact-actions">{content.table("contact.cards").map((card, index) => {
          const cardId = `contact.card.${index}`;
          const cardContent = <><small><CanvasText {...editableTextProps(`${cardId}.eyebrow`, card.eyebrow)} /></small><strong><CanvasText {...editableTextProps(`${cardId}.title`, card.title)} /></strong>{card.href ? <span>↗</span> : null}</>;
          return card.href ? <a href={card.href} key={card.eyebrow} {...canvasProps(cardId, `${card.eyebrow}聯絡卡`)}>{cardContent}</a> : <div key={card.eyebrow} {...canvasProps(cardId, `${card.eyebrow}聯絡卡`)}>{cardContent}</div>;
        })}</div>
      </section>

        <footer><Image src="/brand/synaiq-logo-light.svg" alt="SynaiQ" width={145} height={25} /><p>{siteContent.text("footer.company")}</p><span>{siteContent.text("footer.copyright")}</span></footer>
      </main>
    </>
  );
}
