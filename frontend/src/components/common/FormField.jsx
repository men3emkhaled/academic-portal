import { cn } from "@/lib/utils"

/**
 * Label + control + (error|hint) wrapper. Place a shadcn Input/Select/Textarea as the child.
 */
export function FormField({ label, htmlFor, required, error, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export default FormField
