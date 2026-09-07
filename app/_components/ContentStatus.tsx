import type { ReactNode } from "react";

type ContentStatusProps = {
  children: ReactNode;
  tone?: "pending" | "draft";
};

export default function ContentStatus({ children, tone = "pending" }: ContentStatusProps) {
  return <span className={`content-status content-status-${tone}`}>{children}</span>;
}
