export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-border bg-bg-elevated p-5 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-sm font-medium text-fg">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
