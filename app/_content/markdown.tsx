import { Fragment } from "react";

type MarkdownRow = Record<string, string>;

export type PageMarkdown = {
  text: (key: string) => string;
  lines: (key: string) => string[];
  table: (key: string) => MarkdownRow[];
};

const cleanCell = (cell: string) => cell.trim().replace(/\\\|/g, "|");

export function parsePageMarkdown(source: string): PageMarkdown {
  const sections = new Map<string, string>();
  let activeKey: string | null = null;
  let activeLines: string[] = [];

  const flush = () => {
    if (activeKey) sections.set(activeKey, activeLines.join("\n").trim());
  };

  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
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

  const text = (key: string) => {
    const value = sections.get(key);
    if (value === undefined) throw new Error(`Missing Markdown content section: ${key}`);
    return value;
  };

  const lines = (key: string) => text(key)
    .split("\n")
    .map((line) => line.trim().replace(/^[-*+]\s+/, "").replace(/^\d+[.)]\s+/, ""))
    .filter(Boolean);

  const table = (key: string) => {
    const rows = text(key).split("\n").filter((line) => line.trim().startsWith("|"));
    if (rows.length < 2) return [];
    const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map(cleanCell);
    const headers = cells(rows[0]);
    return rows.slice(2).map((row) => Object.fromEntries(headers.map((header, index) => [header, cells(row)[index] ?? ""])));
  };

  return { text, lines, table };
}

export function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <Fragment key={`${index}-${line}`}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}
