import {ColumnDef} from "@tanstack/react-table";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {buildSelectEntityColumn} from "@/components/ui/table/action-columns/entity-action-columns.tsx";
import React from "react";
import {useQuery} from "@apollo/client";
import {GET_SCANNER_MODULE_NAMES} from "@/components/graphql/app.graphql.ts";

export type Scanner = {
    id: string;
}

const columns: ColumnDef<Scanner>[] = [
    buildSelectEntityColumn<Scanner>(),
    {
        accessorKey: "id",
        header: "Module",
    },
];

type ScannersTableProps = {
    setSelectedScanners: React.Dispatch<React.SetStateAction<Scanner[]>>
}

export function ScannersTable(
    {
        setSelectedScanners,
    }: Readonly<ScannersTableProps>
) {
    const {data} = useQuery(GET_SCANNER_MODULE_NAMES);
    const scanners: Scanner[] = (
        data?.scanner_module_name_list?.filter((moduleName): moduleName is string => moduleName != null) ?? []
    ).map((moduleName: string) => ({id: moduleName}));

    return (
        <StateHandlingScrollableDataTable
            columns={columns}
            data={scanners}
            onRowSelectionChange={(selectedRows: Scanner[]) => {
                setSelectedScanners(selectedRows);
            }}
        />
    );
}
