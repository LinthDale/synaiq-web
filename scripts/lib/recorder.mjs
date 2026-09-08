/**
 * 記錄「舊 key → 新欄位路徑」的對照關係。
 *
 * 遷移腳本每讀一個舊 key 就必須經過這裡，因此
 * 「舊檔解析出的 key 集合」減去「recorder 記過的 key 集合」= 未遷移的 key，
 * 這個差集必須是空的（`migrate-content.mjs` 會 assert）。
 */

export function createRecorder(content, { page, defaultRoute }) {
  const used = new Set();
  const records = [];

  const push = (oldKey, kind, newPath, values, route) => {
    if (used.has(oldKey)) {
      throw new Error(`${page}.md 的舊 key「${oldKey}」被對應了兩次。`);
    }
    used.add(oldKey);
    records.push({
      page,
      oldKey,
      kind,
      newPath,
      route: route ?? defaultRoute,
      values: values.map((v) => String(v).trim()).filter(Boolean),
    });
  };

  return {
    /** 單一文字區塊。 */
    text(oldKey, newPath, options = {}) {
      const value = content.text(oldKey);
      push(oldKey, 'text', newPath, [value], options.route);
      return value;
    },

    /** 清單區塊（`-` 或數字清單）。 */
    lines(oldKey, newPath, options = {}) {
      const value = content.lines(oldKey);
      push(oldKey, 'lines', newPath, value, options.route);
      return value;
    },

    /** 表格區塊。驗證值取所有非空儲存格。 */
    table(oldKey, newPath, options = {}) {
      const rows = content.table(oldKey);
      const values = options.values ? options.values(rows) : rows.flatMap((row) => Object.values(row));
      push(oldKey, 'table', newPath, values, options.route);
      return rows;
    },

    /**
     * 值在新樹中不是原樣輸出時使用（例如 `%s｜SynaiQ` 這種格式字串）。
     * `values` 是「應該出現在建置後 HTML 裡」的字串。
     */
    custom(oldKey, newPath, rawValue, values, options = {}) {
      push(oldKey, 'custom', newPath, values, options.route);
      return rawValue;
    },

    records,
    unmapped: () => content.keys().filter((key) => !used.has(key)),
  };
}
