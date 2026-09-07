"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import siteSource from "@/content/pages/site.md?raw";
import { parsePageMarkdown } from "../_content/markdown";

const siteContent = parsePageMarkdown(siteSource);
const navigation = siteContent.table("header.navigation");

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isMenuOpen) return;
      event.preventDefault();
      setIsMenuOpen(false);
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const closeMenu = (restoreFocus = false) => {
    setIsMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  const isCurrent = (href: string) => {
    if (pathname === href) return true;
    if (href !== "/products") return false;
    return ["/wally", "/knowledge-base", "/generative-ai", "/agi"].some((path) => pathname?.startsWith(path));
  };

  return (
    <>
      <a className="skip-link" href="#main-content">{siteContent.text("header.skip-link")}</a>
      <header className="site-header">
      {/* Native navigation keeps vinext production routing from intercepting the home link. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="brand" href="/" aria-label={siteContent.text("header.home-label")} onClick={() => closeMenu()}>
        <Image src="/brand/synaiq-logo-light.svg" alt="SynaiQ" width={164} height={28} priority />
      </a>
      <button
        ref={menuButtonRef}
        className={`menu-toggle${isMenuOpen ? " is-open" : ""}`}
        type="button"
        aria-controls="mobile-navigation"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? siteContent.text("header.menu-close") : siteContent.text("header.menu-open")}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <nav id="mobile-navigation" aria-label={siteContent.text("header.navigation-label")} data-open={isMenuOpen}>
        {navigation.map((item) => (
          <a className={item.style === "cta" ? "nav-cta" : undefined} href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined} onClick={() => closeMenu()} key={item.href}>{item.label}</a>
        ))}
      </nav>
      </header>
    </>
  );
}
