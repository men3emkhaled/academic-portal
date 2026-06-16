import { cn } from "@/lib/utils"

const VARIANTS = {
  neutral: "border-transparent bg-muted text-muted-foreground",
  success: "border-primary/20 bg-primary/10 text-primary",
  accent: "border-primary/20 bg-primary/10 text-primary",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
}

/**
 * Small status pill. Semantic only — success(green)/warning(amber)/danger(red)/neutral.
 */
export function StatusBadge({ variant = "neutral", children, className, icon: Icon }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        VARIANTS[variant] ?? VARIANTS.neutral,
        className
      )}
    >
      {Icon ? <Icon className="size-3" /> : null}
      {children}
    </span>
  )
}

export default StatusBadge
