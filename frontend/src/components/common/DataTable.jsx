import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { LoadingState } from "./LoadingState"
import { EmptyState } from "./EmptyState"

/**
 * Dense table with built-in loading/empty handling.
 * columns: [{ key, header, render?(row, i), headClassName?, cellClassName? }]
 */
export function DataTable({
  columns = [],
  rows = [],
  getRowKey,
  loading = false,
  empty,
  onRowClick,
  className,
}) {
  if (loading) return <LoadingState />
  if (!rows.length) {
    return empty ?? <EmptyState title="Nothing here yet" />
  }
  return (
    <div className={cn("overflow-hidden rounded-xl border", className)}>
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={cn("text-xs text-muted-foreground", c.headClassName)}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={getRowKey ? getRowKey(row, i) : i}
              onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              className={cn(onRowClick && "cursor-pointer")}
            >
              {columns.map((c) => (
                <TableCell key={c.key} className={c.cellClassName}>
                  {c.render ? c.render(row, i) : row[c.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
