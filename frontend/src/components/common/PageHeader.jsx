import { cn } from "@/lib/utils"

/**
 * Quiet page title row. Replaces the old giant clamp/uppercase/font-black heroes.
 */
export function PageHeader({ title, description, actions, icon: Icon, className }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
            <Icon className="size-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export default PageHeader
