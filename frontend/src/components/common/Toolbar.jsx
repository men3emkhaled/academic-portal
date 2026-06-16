import { cn } from "@/lib/utils"

/**
 * Responsive control row, typically above a table/list: search/filters on the
 * start side, actions on the end side.
 */
export function Toolbar({ children, className }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      {children}
    </div>
  )
}

export default Toolbar
