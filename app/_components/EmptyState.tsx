import ContentStatus from "./ContentStatus";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: { href: string; label: string };
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <ContentStatus>{title}</ContentStatus>
      <p>{description}</p>
      {action ? <a className="text-link empty-state-action" href={action.href}>{action.label} ↗</a> : null}
    </div>
  );
}
