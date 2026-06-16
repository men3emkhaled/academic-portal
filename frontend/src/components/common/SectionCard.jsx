import { cn } from "@/lib/utils"

/**
 * A bordered neutral panel with an optional header (title + actions).
 */
export function SectionCard({ title, description, actions, children, className, bodyClassName, header }) {
  const hasHeader = header || title || actions
  return (
    <section className={cn("overflow-hidden rounded-xl border bg-card text-card-foreground", className)}>
      {hasHeader ? (
        header ?? (
          <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="min-w-0">
              {title ? <h2 className="truncate text-sm font-medium text-foreground">{title}</h2> : null}
              {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </header>
        )
      ) : null}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  )
}

export default SectionCard
