import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

/**
 * Text input with a leading search icon. RTL-aware (logical `start`/`ps`). Forwards input props.
 */
export function SearchInput({ className, inputClassName, ...props }) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" className={cn("ps-9", inputClassName)} {...props} />
    </div>
  )
}

export default SearchInput
