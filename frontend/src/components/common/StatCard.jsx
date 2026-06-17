import { cn } from "@/lib/utils"

/**
 * Compact metric tile. `accent` tints the icon chip green for the key metric.
 */
export function StatCard({ label, value, icon: Icon, hint, accent = false, className }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
        {Icon ? (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground",
              accent && "border-primary/20 bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export default StatCard
