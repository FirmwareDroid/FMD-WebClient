import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {FirmwareAllFragment} from "@/__generated__/graphql.ts";
import {useQuery} from "@apollo/client";
import {
    FIRMWARE_ALL,
    GET_FIRMWARES_BY_OBJECT_IDS, SCAN_APKS_BY_FIRMWARE_OBJECT_IDS,
} from "@/components/graphql/firmware.graphql.ts";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {useFragment} from "@/__generated__";
import {buildFirmwareActionColumns} from "@/components/ui/table/action-columns/firmware-action-columns.tsx";

const columns: ColumnDef<FirmwareAllFragment>[] = [
    ...buildFirmwareActionColumns<FirmwareAllFragment>(SCAN_APKS_BY_FIRMWARE_OBJECT_IDS),
    {
        id: "id",
        accessorKey: "id",
        header: "ID",
        meta: {hidden: true},
    },
    {
        id: "absoluteStorePath",
        accessorKey: "absoluteStorePath",
        header: "Absolute Store Path",
        meta: {hidden: true},
    },
    {
        id: "aecsBuildFilePath",
        accessorKey: "aecsBuildFilePath",
        header: "AECS Build File Path",
        meta: {hidden: true},
    },
    {
        id: "filename",
        accessorKey: "filename",
        header: "Filename",
        meta: {hidden: true},
    },
    {
        id: "hasFileIndex",
        accessorKey: "hasFileIndex",
        header: "Has file index?",
        meta: {hidden: true},
    },
    {
        id: "hasFuzzyHashIndex",
        accessorKey: "hasFuzzyHashIndex",
        header: "Has fuzzy hash index?",
        meta: {hidden: true},
    },
    {
        id: "indexedDate",
        accessorKey: "indexedDate",
        header: "Indexed Date",
    },
    {
        id: "md5",
        accessorKey: "md5",
        header: "MD5",
        meta: {hidden: true},
    },
    {
        id: "originalFilename",
        accessorKey: "originalFilename",
        header: "Original Filename",
    },
    {
        id: "osVendor",
        accessorKey: "osVendor",
        header: "OS Vendor",
    },
    {
        id: "relativeStorePath",
        accessorKey: "relativeStorePath",
        header: "Relative Store Path",
        meta: {hidden: true},
    },
    {
        id: "sha1",
        accessorKey: "sha1",
        header: "SHA-1",
        meta: {hidden: true},
    },
    {
        id: "sha256",
        accessorKey: "sha256",
        header: "SHA-256",
        meta: {hidden: true},
    },
    {
        id: "tag",
        accessorKey: "tag",
        header: "Tag",
    },
    {
        id: "versionDetected",
        accessorKey: "versionDetected",
        header: "Version Detected",
    },
    {
        id: "pk",
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