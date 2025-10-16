import {ColumnDef} from "@tanstack/react-table";
import {AppAllFragment} from "@/__generated__/graphql.ts";
import {useQuery} from "@apollo/client";
import {useFragment} from "@/__generated__";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {BasePage} from "@/pages/base-page.tsx";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {APP_ALL, GET_APPS_BY_FIRMWARE_OBJECT_IDS, SCAN_APKS_BY_OBJECT_IDS} from "@/components/graphql/app.graphql.ts";
import {useParams} from "react-router";
import {buildAppActionColumns} from "@/components/ui/table/action-columns/app-action-columns.tsx";

const columns: ColumnDef<AppAllFragment>[] = [
    ...buildAppActionColumns<AppAllFragment>(SCAN_APKS_BY_OBJECT_IDS),
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
        id: "androidManifestDict",
        accessorKey: "androidManifestDict",
        header: "Android Manifest Dict",
        meta: {hidden: true},
    },
    {
        id: "fileSizeBytes",
        accessorKey: "fileSizeBytes",
        header: "File Size (Bytes)",
    },
    {
        id: "filename",
        accessorKey: "filename",
        header: "Filename",
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
        id: "packagename",
        accessorKey: "packagename",
        header: "Package Name",
    },
    {
        id: "partitionName",
        accessorKey: "partitionName",
        header: "Partition Name",
    },
    {
        id: "pk",
        accessorKey: "pk",
        header: "Object ID",
    },
    {
        id: "relativeFirmwarePath",
        accessorKey: "relativeFirmwarePath",
        header: "Relative Firmware Path",
        meta: {hidden: true},
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
        id: "firmwareIdReference.id",
        accessorKey: "firmwareIdReference.id",
        header: "Firmware ID",
        meta: {hidden: true},
    },
];

export function AppsPage() {
    const {firmwareId} = useParams<{ firmwareId?: string }>();

    let firmwareObjectId: string | undefined;
    if (firmwareId) {
        firmwareObjectId = convertIdToObjectId(firmwareId);
    }

    const {
        loading: appsLoading,
        error: appsError,
        data: appsData,
    } = useQuery(GET_APPS_BY_FIRMWARE_OBJECT_IDS, {
        variables: {objectIds: firmwareObjectId},
        fetchPolicy: "cache-first",
    });

    const apps = (appsData?.android_firmware_connection?.edges ?? [])
        .flatMap(firmwareEdge => (firmwareEdge?.node?.androidAppIdList?.edges ?? []))
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(edge => useFragment(APP_ALL, edge?.node))
        .filter(isNonNullish);

    return (
        <BasePage title="Apps">
            <StateHandlingScrollableDataTable
                columns={columns}
                data={apps}
                dataLoading={appsLoading}
                dataError={appsError}
            />
        </BasePage>
    );
}
