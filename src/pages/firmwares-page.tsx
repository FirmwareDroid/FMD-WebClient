import {ColumnDef} from "@tanstack/react-table";
import {BasePage} from "@/pages/base-page.tsx";
import {DataTable} from "@/components/ui/table/data-table.tsx";
import {FirmwareTableRowFragment} from "@/__generated__/graphql.ts";
import {useQuery} from "@apollo/client";
import {
    FIRMWARE_TABLE_ROW,
    GET_FIRMWARE_OBJECT_ID_LIST, GET_FIRMWARES_BY_OBJECT_IDS,
} from "@/components/graphql/firmware.graphql.ts";
import {useMemo} from "react";
import {useFragment} from "@/__generated__";
import {nonNullable} from "@/lib/non-nullable.ts";

const columns: ColumnDef<FirmwareTableRowFragment>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "absoluteStorePath",
        header: "Absolute Store Path",
    }
];

export function FirmwaresPage() {
    const {
        data: idsData,
    } = useQuery(GET_FIRMWARE_OBJECT_ID_LIST);

    const objectIds = useMemo(() =>
            (idsData?.android_firmware_id_list ?? []).filter(Boolean) as string[],
        [idsData]
    );

    const {
        data: firmwaresData,
    } = useQuery(GET_FIRMWARES_BY_OBJECT_IDS, {
        variables: {objectIds},
        skip: objectIds.length === 0,
    });

    const firmwares: FirmwareTableRowFragment[] = useMemo(
        () =>
            ((firmwaresData?.android_firmware_list ?? [])
                    .filter(nonNullable)
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    .map((item) => useFragment(FIRMWARE_TABLE_ROW, item))
                    .filter(nonNullable)
            ),
        [firmwaresData]
    );

    return (
        <BasePage title="Firmwares">
            <DataTable columns={columns} data={firmwares}/>
        </BasePage>
    );
}