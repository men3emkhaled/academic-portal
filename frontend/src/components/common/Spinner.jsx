import { cn } from "@/lib/utils"

export function Spinner({ className, ...props }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export default Spinner
