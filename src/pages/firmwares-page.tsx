import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {FirmwareAllFragment} from "@/__generated__/graphql.ts";
import {useQuery} from "@apollo/client";
import {
    FIRMWARE_ALL,
    GET_FIRMWARES_BY_OBJECT_IDS, SCAN_APKS_BY_FIRMWARE_OBJECT_IDS,
} from "@/components/graphql/firmware.graphql.ts";
import {buildFirmwareActionColumns} from "@/components/ui/table/action-columns/entity-action-columns.tsx";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {useFragment} from "@/__generated__";

const columns: ColumnDef<FirmwareAllFragment>[] = [
    ...buildFirmwareActionColumns<FirmwareAllFragment>(SCAN_APKS_BY_FIRMWARE_OBJECT_IDS),
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
        header: "Has file index?",
    },
    {
        accessorKey: "hasFuzzyHashIndex",
        header: "Has fuzzy hash index?",
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
        loading: firmwaresLoading,
        error: firmwaresError,
        data: firmwaresData,
    } = useQuery(GET_FIRMWARES_BY_OBJECT_IDS, {
        fetchPolicy: "cache-first",
    });

    const firmwares = (firmwaresData?.android_firmware_connection?.edges ?? [])
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(edge => useFragment(FIRMWARE_ALL, edge?.node))
        .filter(isNonNullish)

    return (
        <BasePage title="Firmwares">
            <StateHandlingScrollableDataTable
                columns={columns}
                data={firmwares}
                dataLoading={firmwaresLoading}
                dataError={firmwaresError}
            />
        </BasePage>
    );
}