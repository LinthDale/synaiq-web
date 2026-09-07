/**
 * 在建置期直接讀 `src/styles/tokens.css`，把 token 名稱與實際值解析出來。
 *
 * 為什麼用解析而不是手抄一份清單：`/styleguide` 必須「列出全部 token 的變數名與
 * 實際值」（PRD-001 FR-102）。手抄的清單一定會跟 CSS 走鐘；解析則保證
 * 「改 tokens.css 一個值 → 手冊頁同步變動」這條驗收條件永遠成立。
 */

// ?raw 讓 Vite 在建置期把檔案內容內嵌進來，dev 與 build 行為一致。
import tokensCss from '../styles/tokens.css?raw';

export type Token = { name: string; value: string };
export type TokenGroup = { title: string; tokens: Token[] };

/** `/* --- 標題 ------ *\/` 形式的分組註解。 */
const GROUP_HEADER = /^\/\*\s*-{2,}\s*(.+?)\s*-{2,}\s*\*\/$/;
const DECLARATION = /^(--[\w-]+)\s*:\s*(.+);$/;

export function readTokenGroups(): TokenGroup[] {
  const css = tokensCss;
  const groups: TokenGroup[] = [];

  let current: TokenGroup | null = null;
  let pending = '';
  let inBlockComment = false;

  for (const raw of css.split('\n')) {
    const line = raw.trim();

    const header = line.match(GROUP_HEADER);
    if (header) {
      current = { title: header[1], tokens: [] };
      groups.push(current);
      continue;
    }

    if (inBlockComment) {
      if (line.includes('*/')) inBlockComment = false;
      continue;
    }

    if (line.startsWith('/*')) {
      inBlockComment = !line.includes('*/');
      continue;
    }

    if (pending === '' && !line.startsWith('--')) continue;

    pending = pending === '' ? line : `${pending} ${line}`;
    if (!pending.endsWith(';')) continue;

    const declaration = pending.match(DECLARATION);
    pending = '';
    if (!declaration) continue;
    if (!current) {
      throw new Error(
        `tokens.css 的「${declaration[1]}」不在任何分組註解底下；請先加一行 /* --- 分組名 --- */。`,
      );
    }
    current.tokens.push({ name: declaration[1], value: declaration[2].trim() });
  }

  const total = groups.reduce((count, group) => count + group.tokens.length, 0);
  if (total === 0) throw new Error('tokens.css 解析不到任何 custom property，請檢查格式。');

  return groups;
}

/** 預覽格：`swatch` 畫色塊、`bar` 畫長度條、`text` 直接把樣式套在示範文字上。 */
export type TokenPreview = { kind: 'swatch' | 'bar' | 'text'; style: string };

const TEXT_PREVIEWS: Array<[string, string]> = [
  ['--text-', 'font-size'],
  ['--font-', 'font-family'],
  ['--weight-', 'font-weight'],
  ['--leading-', 'line-height'],
  ['--tracking-', 'letter-spacing'],
];

/**
 * 依 token 名稱前綴決定怎麼預覽。
 * 一律用 `var()` 引用，手冊頁本身不出現任何硬編碼數值或色值。
 */
export function previewFor(token: Token): TokenPreview {
  const name = token.name;

  if (name.startsWith('--color-')) {
    return { kind: 'swatch', style: `background-color: var(${name})` };
  }

  if (name.startsWith('--radius-')) {
    return { kind: 'swatch', style: `background-color: var(--color-ink-300); border-radius: var(${name})` };
  }

  for (const [prefix, property] of TEXT_PREVIEWS) {
    if (name.startsWith(prefix)) return { kind: 'text', style: `${property}: var(${name})` };
  }

  // 其餘（--space-*、--layout-*、--border-width）都是長度，用一條橫條表示。
  return { kind: 'bar', style: `inline-size: var(${name})` };
}
