# CSS 手冊（PRD-001 FR-102）

本手冊適用於 **Astro Phase A 的 `src/`**，不是已核准、已上線的 `docs/design/live-prototype/`。
官網的集中字級／配色設定與分檔方式請看 [官網樣式維護指南](../design/live-prototype/STYLE-GUIDE.md)。

Astro 基礎不使用 Tailwind、不使用 CSS-in-JS。樣式責任如下：

| 放哪裡 | 寫什麼 | 誰能宣告 `--` 變數 |
|---|---|---|
| `src/styles/tokens.css` | 全站設計 token | **只有這裡** |
| `src/styles/base.css` | 最小重設與文件層樣式 | 否，只能 `var()` |
| `.astro` 的 scoped `<style>` | 該元件自己的版面 | 否，只能 `var()` |
| React island 的 CSS Modules | 該 island 自己的版面 | 否，只能 `var()` |

## 三條規則

1. **token 單一來源**：任何 `--` 開頭的 custom property 只能在 `tokens.css` 宣告。
   其他檔案一律 `var(--token-name)` 引用。
2. **零硬編碼色值**：`src/` 底下除 `tokens.css` 外，不得出現 `#`、`rgb(`、`hsl(`。
   `npm test` 會掃描並在命中時失敗。
3. **scoped 優先**：元件樣式寫在該 `.astro` 的 `<style>` 裡，Astro 會自動加上作用域，
   不需要 BEM 之類的命名規約。跨元件共用的版面（`.container`、`.eyebrow`、
   `.visually-hidden`、`.skip-link`）才放 `base.css`。

## 目前的 token 是佔位值

`tokens.css` 現在這一組是**中性佔位**（灰階 + 單一強調色 + 一組 1.25 模組化字級 +
一組 4px 間距級數），不是品牌色票。正式數值由 **PRD-005（品牌手冊）** 與
**PRD-003（視覺設計）** 定案後整批置換。置換時只改 `tokens.css`，不需要動任何元件。

## 怎麼改一個 token

```bash
# 1. 改值
#    src/styles/tokens.css → --color-accent: <新值>;
# 2. 看結果
npm run dev          # http://localhost:4321/styleguide/
# 3. 驗證沒有把硬編碼色值帶進來
npm test
```

`/styleguide` 會**自動**列出新值：該頁是在建置期解析 `tokens.css` 產生的，
沒有另一份手抄清單需要同步。

## 怎麼新增一個 token

1. 在 `tokens.css` 找到對應的分組註解（`/* --- 分組名 --- */`），把宣告加在該組底下。
   不在任何分組底下的宣告會讓建置失敗。
2. 命名前綴決定 `/styleguide` 怎麼預覽它：

   | 前綴 | 預覽 |
   |---|---|
   | `--color-` | 色塊 |
   | `--radius-` | 圓角色塊 |
   | `--text-` / `--font-` / `--weight-` / `--leading-` / `--tracking-` | 套在示範文字上 |
   | 其他（`--space-`、`--layout-`、`--border-`） | 長度橫條 |

   要新增別的預覽方式，改 `src/lib/tokens.ts` 的 `previewFor()`。

## `/styleguide` 是什麼

內部參考頁，同時是元件目錄：

- 全部 token 的變數名、實際值與預覽。
- **每一種內容區塊型別各一個範例**，範例取自真實內容（第一個用到該型別的頁面），
  不使用假資料。schema 或元件改壞時，這頁會第一個看得出來。
- 標記 `<meta name="robots" content="noindex">`，且被 `astro.config.mjs` 的
  sitemap `filter` 排除，不對外索引。
