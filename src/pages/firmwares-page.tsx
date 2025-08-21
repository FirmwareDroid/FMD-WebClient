import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
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
    },
    {
        accessorKey: "aecsBuildFilePath",
        header: "AECS Build File Path",
    },
    {
        accessorKey: "filename",
        header: "Filename",
    },
    {
        accessorKey: "hasFileIndex",
        header: "Has File Index",
    },
    {
        accessorKey: "hasFuzzyHashIndex",
        header: "Has Fuzzy Hash Index",
    },
    {
        accessorKey: "indexedDate",
        header: "Indexed Date",
    },
    {
        accessorKey: "md5",
        header: "MD5",
    },
    {
        accessorKey: "originalFilename",
        header: "Original Filename",
    },
    {
        accessorKey: "osVendor",
        header: "OS Vendor",
    },
    {
        accessorKey: "relativeStorePath",
        header: "Relative Store Path",
    },
    {
        accessorKey: "sha1",
        header: "SHA-1",
    },
    {
        accessorKey: "sha256",
        header: "SHA-256",
    },
    {
        accessorKey: "tag",
        header: "Tag",
    },
    {
        accessorKey: "versionDetected",
        header: "Version Detected",
    },
    {
        accessorKey: "pk",
        header: "Object ID",
    },
];

export function FirmwaresPage() {
    const {
        loading: idsLoading,
        error: idsError,
        data: idsData,
    } = useQuery(GET_FIRMWARE_OBJECT_ID_LIST);

    const objectIds = useMemo(() =>
            (idsData?.android_firmware_id_list ?? []).filter(Boolean) as string[],
        [idsData]
    );

    const {
        loading: firmwaresLoading,
        error: firmwaresError,
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
            <StateHandlingScrollableDataTable
                columns={columns}
                data={firmwares}
                idsLoading={idsLoading}
                dataLoading={firmwaresLoading}
                idsError={idsError}
                dataError={firmwaresError}
            />
        </BasePage>
    );
}