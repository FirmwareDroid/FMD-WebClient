import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Download } from "lucide-react";

type DataTableExportProps<TData> = {
  table: Table<TData>;
  filenamePrefix?: string;
  label?: string;
};

export function DataTableExport<TData>({
  table,
  filenamePrefix = "export",
  label = "Export selected",
}: Readonly<DataTableExportProps<TData>>) {
  const selectedCount = table.getSelectedRowModel().flatRows.length;

  const onExport = () => {
    const selected = table.getSelectedRowModel().flatRows.map((r) => r.original);
    if (!selected || selected.length === 0) return;

    const blob = new Blob([JSON.stringify(selected, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = `${filenamePrefix}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={onExport} disabled={selectedCount === 0}>
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

export default DataTableExport;
