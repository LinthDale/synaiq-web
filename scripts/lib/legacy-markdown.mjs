/**
 * 舊站 `## key` 解析器的逐字移植。
 *
 * 來源：舊樹 `app/_content/markdown.tsx`（已隨 FR-101 刪除）。
 * `cleanCell` / `parsePageMarkdown` / `text` / `lines` / `table` 的正則與流程
 * 與原始檔完全一致 —— 遷移的正確性建立在「用同一支解析器讀同一批檔案」上，
 * 因此本檔禁止「順手改善」。唯一的新增是 `keys()`，用來檢查零遺漏。
 */

const cleanCell = (cell) => cell.trim().replace(/\\\|/g, '|');

export function parsePageMarkdown(source) {
  const sections = new Map();
  let activeKey = null;
  let activeLines = [];

  const flush = () => {
    if (activeKey) sections.set(activeKey, activeLines.join('\n').trim());
  };

  for (const line of source.replace(/\r\n/g, '\n').split('\n')) {
    const heading = line.match(/^##\s+([a-z0-9._-]+)\s*$/i);
    if (heading) {
      flush();
      activeKey = heading[1];
      activeLines = [];
    } else if (activeKey) {
      activeLines.push(line);
    }
  }
  flush();

  const text = (key) => {
    const value = sections.get(key);
    if (value === undefined) throw new Error(`Missing Markdown content section: ${key}`);
    return value;
  };

  const lines = (key) =>
    text(key)
      .split('\n')
      .map((line) =>
        line
          .trim()
          .replace(/^[-*+]\s+/, '')
          .replace(/^\d+[.)]\s+/, ''),
      )
      .filter(Boolean);

  const table = (key) => {
    const rows = text(key)
      .split('\n')
      .filter((line) => line.trim().startsWith('|'));
    if (rows.length < 2) return [];
    const cells = (row) =>
      row
        .trim()
        .replace(/^\||\|$/g, '')
        .split(/(?<!\\)\|/)
        .map(cleanCell);
    const headers = cells(rows[0]);
    return rows
      .slice(2)
      .map((row) =>
        Object.fromEntries(headers.map((header, index) => [header, cells(row)[index] ?? ''])),
      );
  };

  return { text, lines, table, keys: () => [...sections.keys()] };
}
