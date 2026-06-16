import { cn } from "@/lib/utils"

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <span className="flex size-10 items-center justify-center rounded-lg border bg-card text-muted-foreground">
          <Icon className="size-5" />
        </span>
      ) : null}
      <div className="max-w-sm">
        {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

export default EmptyState
