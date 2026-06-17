import { cn } from "@/lib/utils"

/**
 * Compact segmented control (pill toggle).
 * options: [{ value, label, icon?, count? }]
 */
export function SegmentedTabs({ value, onChange, options = [], className, size = "default" }) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value
        const Icon = opt.icon
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange?.(opt.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors",
              pad,
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon ? <Icon className="size-4" /> : null}
            {opt.label}
            {opt.count != null ? (
              <span className="ms-1 rounded bg-muted px-1.5 text-xs text-muted-foreground">{opt.count}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedTabs
