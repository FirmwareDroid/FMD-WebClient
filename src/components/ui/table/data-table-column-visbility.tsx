"use client"

import {DropdownMenuTrigger} from "@radix-ui/react-dropdown-menu"
import {Table} from "@tanstack/react-table"
import {Settings2} from "lucide-react"
import {
    DropdownMenu, DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";

export function DataTableViewOptions<TData>(
    {
        table,
    }: Readonly<{ table: Table<TData> }>) {
    const hideableColumns = table.getAllColumns()
        .filter(c => typeof c.accessorFn !== "undefined" && c.getCanHide());

    return (
        <>
            {
                hideableColumns.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto hidden h-8 lg:flex"
                            >
                                <Settings2/>
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            {hideableColumns
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => {
                                                column.toggleVisibility(value);
                                            }}
                                        >
                                            {typeof column.columnDef.header === "string"
                                                ? (column.columnDef.header)
                                                : (column.id)
                                            }
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        </>
    )
}
