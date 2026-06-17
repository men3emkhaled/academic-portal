import { cn } from "@/lib/utils"

/**
 * Centered content frame with consistent padding and vertical rhythm.
 * Wrap the main content of every dashboard page in this.
 */
export function PageContainer({ children, className, size = "default" }) {
  const max = size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-[1600px]" : "max-w-[1400px]"
  return (
    <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6", max, className)}>
      {children}
    </div>
  )
}

export default PageContainer
