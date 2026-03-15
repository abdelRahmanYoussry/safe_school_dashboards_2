import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessor: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ columns, data, onRowClick }: DataTableProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl overflow-hidden border border-black/5 bg-white/50 backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-black/[0.1] backdrop-blur-md">
          <TableRow className="hover:bg-transparent border-black/5">
            {columns.map((column, i) => (
              <TableHead 
                key={i} 
                className={cn(
                  "text-[#002626] font-semibold h-12 px-2",
                  i === 0 && "pl-6",
                  i === columns.length - 1 && "pr-6"
                )}
              >
                {t(column.header)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, i) => (
              <TableRow
                key={i}
                className={`border-black/5 ${onRowClick ? "cursor-pointer hover:bg-black/[0.02] transition-colors" : ""}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, j) => (
                  <TableCell 
                    key={j} 
                    className={cn(
                      "py-4 font-medium text-foreground/80 px-2",
                      j === 0 && "pl-6",
                      j === columns.length - 1 && "pr-6"
                    )}
                  >
                    {column.accessor(item, i)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {t("No data found")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
