// Regenerate the approved static screen assets from one logo master and locale text.
// Run from any directory: node docs/design/live-prototype/scripts/sync-brand-screens.mjs
// Pass --check for a read-only freshness check. No network or upload endpoint is used.
import { lstatSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { isAbsolute, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { screenLocaleSuffixes, screenMessages } from '../locale-screens.js';
import { BRAND, PRODUCT_BRAND } from '../brand.js';

const root = new URL('../', import.meta.url);
const screenNames = Object.freeze(['search', 'library']);
const normalize = source => source.replaceAll('\r\n', '\n');
const escapeXml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[character]);

export function resolveBrandAsset(assetPath) {
  const invalid = () => new Error('Logo master must be a local SVG inside assets');
  if (typeof assetPath !== 'string' || !assetPath.startsWith('assets/') || !/\.svg$/i.test(assetPath)
    || /[%\\:?#\u0000-\u001f]/.test(assetPath)
    || assetPath.split('/').some(segment => !segment || segment === '.' || segment === '..')) throw invalid();
  const segments = assetPath.split('/');
  for (let index = 1; index <= segments.length; index += 1) {
    const component = new URL(segments.slice(0, index).join('/'), root);
    if (lstatSync(component).isSymbolicLink()) throw invalid();
  }
  const target = new URL(assetPath, root);
  // Keep both lexical and physical paths within the same assets boundary.
  const resolved = relative(realpathSync(new URL('assets/', root)), realpathSync(target));
  const metadata = lstatSync(target);
  if (isAbsolute(resolved) || resolved === '..' || resolved.startsWith(`..${sep}`)
    || !metadata.isFile() || metadata.isSymbolicLink()) throw invalid();
  return target;
}

export function renderScreen(template, messages, logo, art = {}, productLogo = logo, layout = {}) {
  // Canonical SVG bytes keep embedded logos identical on Windows and Linux.
  const encodeLogo = bytes => Buffer.from(normalize(bytes.toString('utf8'))).toString('base64');
  const used = new Set();
  const source = template.replace(/\{\{([a-zA-Z][a-zA-Z0-9.]*)\}\}/g, (placeholder, key) => {
    if (key === 'brand.logoDataUrl') return `data:image/svg+xml;base64,${encodeLogo(logo)}`;
    if (key === 'product.logoDataUrl') return `data:image/svg+xml;base64,${encodeLogo(productLogo)}`;
    if (key.startsWith('layout.')) {
      const value = layout[key.slice(7)];
      if (!Number.isFinite(value)) throw new Error(`Missing screen layout value: ${key}`);
      return String(value);
    }
    if (key.startsWith('art.')) {
      const value = art[key.slice(4)];
      if (typeof value !== 'string' || !/^data:image\/(png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) throw new Error(`Invalid approved screen artwork: ${key}`);
      return value;
    }
    if (!Object.hasOwn(messages, key)) throw new Error(`Missing screen text: ${key}`);
    if (typeof messages[key] !== 'string') throw new TypeError(`Screen text ${key} must be a string`);
    used.add(key);
    return escapeXml(messages[key]);
  });
  for (const key of Object.keys(messages)) {
    if (!used.has(key)) throw new Error(`Unused screen text: ${key}`);
  }
  if (/\{\{/.test(source)) throw new Error('Unresolved screen template placeholder');
  return source;
}

export function buildScreens() {
  const logo = readFileSync(resolveBrandAsset(BRAND.ink));
  const productLogo = readFileSync(resolveBrandAsset(PRODUCT_BRAND.ink));
  if (!/<svg\b/.test(logo.toString('utf8'))) throw new Error('The approved ink logo master must be an SVG');
  // Fixed approved local assets only. No remote references or private image paths.
  const art = Object.fromEntries(Object.entries({ edge: 'demo-paper-edge.webp', kip: 'kip-wordmark.png', dialogues: 'demo-sidebar-dialogues.webp', pen: 'demo-send-pen.webp' }).map(([key, name]) => {
    const path = new URL(`assets/${name}`, root);
    const metadata = lstatSync(path);
    if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(`Invalid approved artwork file: ${name}`);
    return [key, `data:image/${name.endsWith('.png') ? 'png' : 'webp'};base64,${readFileSync(path).toString('base64')}`];
  }));
  const chrome = normalize(readFileSync(new URL('screen-templates/chrome.svg', root), 'utf8'));
  const templates = Object.fromEntries(screenNames.map(screen => [
    screen, normalize(readFileSync(new URL(`screen-templates/${screen}.svg`, root), 'utf8')).replace('{{chrome}}', chrome),
  ]));
  const outputs = [];
  const paths = new Set();
  for (const [locale, suffix] of Object.entries(screenLocaleSuffixes)) {
    // Match the desktop film header at 1240px, normalized to this 1440px canvas:
    // 24px right padding, 120px product logo, 11px gap, 12px label.
    // Label widths measured with the actual Manrope/Noto Sans TC demo fonts.
    const labelWidths = { 'zh-Hant': 98.359375, en: 146.21875 };
    const productLabelWidth = labelWidths[locale] * 1440 / 1240;
    const layout = {
      productLabelWidth,
      productLogoX: (1440 - 24 * 1440 / 1240) - productLabelWidth - (120 + 11) * 1440 / 1240,
    };
    // Locale suffixes are explicit local configuration, never user-supplied paths.
    if (suffix !== '' && !/^-[a-zA-Z0-9-]+$/.test(suffix)) throw new Error(`Invalid screen locale suffix: ${locale}`);
    for (const screen of screenNames) {
      const messages = screenMessages[locale]?.[screen];
      if (!messages) throw new Error(`Missing screen dictionary: ${locale}/${screen}`);
      const relativePath = `assets/kip-${screen}-demo${suffix}.svg`;
      if (paths.has(relativePath)) throw new Error(`Duplicate screen output: ${relativePath}`);
      paths.add(relativePath);
      outputs.push({ locale, screen, relativePath, source: renderScreen(templates[screen], messages, logo, art, productLogo, layout) });
    }
  }
  return outputs;
}

export function syncBrandScreens({ check = false } = {}) {
  const assets = new URL('assets/', root);
  const directory = lstatSync(assets);
  if (!directory.isDirectory() || directory.isSymbolicLink()) throw new Error('Screen output directory must be the local assets directory');
  const outputs = buildScreens();
  const changes = [];
  // Validate the complete target set before writing any generated asset.
  for (const output of outputs) {
    const target = new URL(output.relativePath, root);
    let metadata;
    try { metadata = lstatSync(target); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (metadata) {
      if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(`Refusing non-file screen target: ${output.relativePath}`);
      if (normalize(readFileSync(target, 'utf8')) === output.source) continue;
    }
    changes.push({ ...output, target });
  }
  if (check && changes.length) throw new Error(`Generated screens are stale: ${changes.map(item => item.relativePath).join(', ')}`);
  if (!check) for (const output of changes) writeFileSync(output.target, output.source, 'utf8');
  return { generated: outputs.length, changed: changes.map(item => item.relativePath) };
}

const invokedDirectly = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (invokedDirectly) {
  try {
    const argumentsList = process.argv.slice(2);
    if (argumentsList.some(argument => argument !== '--check') || argumentsList.length > 1) {
      throw new Error(`Usage: node ${fileURLToPath(import.meta.url)} [--check]`);
    }
    const check = argumentsList.includes('--check');
    const result = syncBrandScreens({ check });
    process.stdout.write(`${check ? 'Verified' : 'Generated'} ${result.generated} screens; ${result.changed.length} updated.\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
