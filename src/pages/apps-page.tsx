import {ColumnDef} from "@tanstack/react-table";
import {AppAllFragment} from "@/__generated__/graphql.ts";
import {useQuery} from "@apollo/client";
import {useFragment} from "@/__generated__";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {BasePage} from "@/pages/base-page.tsx";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {APP_ALL, GET_APPS_BY_FIRMWARE_OBJECT_IDS, SCAN_APKS_BY_OBJECT_IDS} from "@/components/graphql/app.graphql.ts";
import {buildAppActionColumns} from "@/components/ui/table/action-columns/entity-action-columns.tsx";
import {useParams} from "react-router";

const columns: ColumnDef<AppAllFragment>[] = [
    ...buildAppActionColumns<AppAllFragment>(SCAN_APKS_BY_OBJECT_IDS),
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "absoluteStorePath",
        header: "Absolute Store Path",
    },
    {
        accessorKey: "androidManifestDict",
        header: "Android Manifest Dict",
    },
    {
        accessorKey: "fileSizeBytes",
        header: "File Size (Bytes)",
    },
    {
        accessorKey: "filename",
        header: "Filename",
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
        accessorKey: "packagename",
        header: "Package Name",
    },
    {
        accessorKey: "partitionName",
        header: "Partition Name",
    },
    {
        accessorKey: "pk",
        header: "Object ID",
    },
    {
        accessorKey: "relativeFirmwarePath",
        header: "Relative Firmware Path",
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
        accessorKey: "firmwareIdReference.id",
        header: "Firmware ID",
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
