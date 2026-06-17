import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
}

/**
 * Standard modal built on shadcn Dialog. Use instead of hand-rolled `fixed inset-0` backdrops.
 * `footer` renders in the sticky footer bar; pass the form/content as children.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  contentClassName,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(SIZES[size] ?? SIZES.md, "max-h-[90vh] overflow-y-auto", className)}>
        {title || description ? (
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
        ) : null}
        <div className={cn(contentClassName)}>{children}</div>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  )
}

export default Modal
