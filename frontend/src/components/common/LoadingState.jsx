import { cn } from "@/lib/utils"
import { Spinner } from "./Spinner"

export function LoadingState({ className, label }) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 text-muted-foreground",
        className
      )}
    >
      <Spinner className="size-6 text-primary" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  )
}

export default LoadingState
