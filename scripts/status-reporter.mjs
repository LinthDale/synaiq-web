import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const dashboardPath = join(projectRoot, "PROJECT_DASHBOARD.md");
const dashboardStart = "<!-- STATUS:START -->";
const dashboardEnd = "<!-- STATUS:END -->";

const routeFiles = [
  ["首頁", "app/page.tsx"],
  ["關於公司", "app/about/page.tsx"],
  ["產品總覽", "app/products/page.tsx"],
  ["Wally 系列", "app/wally/page.tsx"],
  ["企業知識庫", "app/knowledge-base/page.tsx"],
  ["生成式 AI", "app/generative-ai/page.tsx"],
  ["AGI", "app/agi/page.tsx"],
  ["媒體中心", "app/media/page.tsx"],
  ["聯絡我們", "app/contact/page.tsx"],
];

function readText(relativePath) {
  const absolutePath = join(projectRoot, relativePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function taipeiNow() {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replaceAll("/", "-");
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function collectStatus() {
  const gitStatus = runGit(["status", "--short"]);
  const statusLines = gitStatus ? gitStatus.split(/\r?\n/).filter(Boolean) : [];
  const handoff = readText("PROJECT_HANDOFF.md");
  const subpageContent = readText("website_subpages_content_editable.md");
  const packageJson = JSON.parse(readText("package.json") || "{}");
  const routeResults = routeFiles.map(([label, relativePath]) => ({
    label,
    relativePath,
    exists: existsSync(join(projectRoot, relativePath)),
  }));
  const historicalVerification = handoff.match(
    /- (\d{4}-\d{2}-\d{2}) 已完成 `npm\.cmd run build`、`npm\.cmd test` 與 `npm\.cmd run lint`/,
  );

  return {
    generatedAt: taipeiNow(),
    branch: runGit(["branch", "--show-current"]) || "未知",
    commit: runGit(["log", "-1", "--format=%h %ad %s", "--date=short"]) || "無法取得",
    statusLines,
    routeResults,
    missingRoutes: routeResults.filter((route) => !route.exists),
    pendingMarkers: countMatches(subpageContent, /待補|待確認/g),
    historicalVerification: historicalVerification?.[1] || "未找到交接紀錄",
    scripts: packageJson.scripts || {},
  };
}

function renderStatusBlock(status) {
  const workingTree = status.statusLines.length === 0
    ? "乾淨"
    : `有 ${status.statusLines.length} 筆未提交變更`;
  const routeSummary = status.missingRoutes.length === 0
    ? `9 個主要路由檔案皆存在（即時檢查）`
    : `缺少：${status.missingRoutes.map((route) => route.label).join("、")}`;
  const contentSummary = status.pendingMarkers === 0
    ? "未偵測到待補／待確認標記"
    : `偵測到 ${status.pendingMarkers} 個待補／待確認標記（文案仍需人工確認）`;
  const verificationSummary = status.historicalVerification === "未找到交接紀錄"
    ? "未找到歷史驗證紀錄"
    : `交接紀錄顯示 ${status.historicalVerification} 曾通過；Reporter 不會自行執行驗證指令`;
  const nextSteps = [];

  if (status.pendingMarkers > 0) {
    nextSteps.push("確認 website_subpages_content_editable.md 的待補／待確認內容");
  }
  if (status.statusLines.length > 0) {
    nextSteps.push("檢視未提交變更，確認後再決定是否 commit");
  }
  if (status.historicalVerification !== "未找到交接紀錄") {
    nextSteps.push("在準備交付前重新執行 npm.cmd run build、npm.cmd test 與 npm.cmd run lint");
  }
  if (nextSteps.length === 0) {
    nextSteps.push("目前沒有由 Reporter 自動辨識出的下一步");
  }

  return `${dashboardStart}
### Agent 即時回報

> 產生時間：${status.generatedAt}（Asia/Taipei）

| 檢查項目 | 狀態 | 證據 |
| --- | --- | --- |
| Git 工作區 | ${workingTree} | branch: \`${status.branch}\` |
| 最近 commit | 已讀取 | \`${status.commit}\` |
| 主要路由 | ${status.missingRoutes.length === 0 ? "已建立" : "需處理"} | ${routeSummary} |
| 子頁文案 | ${status.pendingMarkers > 0 ? "等待使用者" : "未偵測阻塞"} | ${contentSummary} |
| Build／Test／Lint | 歷史紀錄 | ${verificationSummary} |

**Agent 建議下一步**

${nextSteps.map((step) => `- ${step}`).join("\n")}

> 這份回報只做唯讀盤點；它不會修改檔案、commit、push 或部署。
${dashboardEnd}`;
}

function printReport(report) {
  if (process.argv.includes("--write")) {
    const currentDashboard = existsSync(dashboardPath)
      ? readFileSync(dashboardPath, "utf8")
      : `${dashboardStart}\n${dashboardEnd}`;
    const startIndex = currentDashboard.indexOf(dashboardStart);
    const endIndex = currentDashboard.indexOf(dashboardEnd);

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      throw new Error("PROJECT_DASHBOARD.md 缺少狀態區塊標記");
    }

    const updatedDashboard = `${currentDashboard.slice(0, startIndex)}${report}${currentDashboard.slice(endIndex + dashboardEnd.length)}`;
    writeFileSync(dashboardPath, updatedDashboard, "utf8");
    console.log(`已更新 ${dashboardPath}`);
    return;
  }

  console.log(report);
}

const status = collectStatus();
const report = renderStatusBlock(status);
printReport(report);
