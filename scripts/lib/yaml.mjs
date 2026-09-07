/**
 * 極簡 YAML 輸出器：只支援本專案 frontmatter 用得到的型別
 * （string / boolean / number / plain object / array），不解析 YAML。
 *
 * 設計取捨
 * - 字串一律用單引號，內部 `'` 以 `''` 逸出：CJK、`:`、`#`、`↗`、`@` 都不需特判。
 * - 含換行的字串改用 block scalar `|-`（保留作者指定的斷行，且不留尾端換行）。
 * - 空陣列輸出 `[]`、空物件輸出 `{}`，避免產生無效的 YAML。
 */

const INDENT = '  ';

export function toYaml(value) {
  if (!isPlainObject(value)) {
    throw new TypeError('toYaml() 的輸入必須是物件（frontmatter 根節點）。');
  }
  return renderObject(value, 0);
}

function renderObject(object, depth) {
  const entries = Object.entries(object).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return `${INDENT.repeat(depth)}{}`;
  return entries.map(([key, val]) => renderEntry(key, val, depth)).join('\n');
}

function renderEntry(key, value, depth) {
  const pad = INDENT.repeat(depth);

  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}${key}: []`;
    return `${pad}${key}:\n${renderArray(value, depth + 1)}`;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return `${pad}${key}: {}`;
    return `${pad}${key}:\n${renderObject(value, depth + 1)}`;
  }

  return `${pad}${key}: ${renderScalar(value, depth)}`;
}

function renderArray(items, depth) {
  const pad = INDENT.repeat(depth);
  return items
    .map((item) => {
      if (Array.isArray(item)) {
        throw new TypeError('不支援巢狀陣列的陣列；請改用物件包一層。');
      }
      if (isPlainObject(item)) {
        const body = renderObject(item, depth + 1);
        // 把第一行的縮排換成 `- `，其餘保持原縮排。
        return `${pad}- ${body.slice((depth + 1) * INDENT.length)}`;
      }
      return `${pad}- ${renderScalar(item, depth)}`;
    })
    .join('\n');
}

function renderScalar(value, depth) {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value !== 'string') {
    throw new TypeError(`不支援的 YAML 值型別：${typeof value}`);
  }
  if (!value.includes('\n')) return `'${value.replaceAll("'", "''")}'`;

  const pad = INDENT.repeat(depth + 1);
  const body = value
    .split('\n')
    .map((line) => `${pad}${line}`)
    .join('\n');
  return `|-\n${body}`;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
