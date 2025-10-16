import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {FileAllFragment} from "@/__generated__/graphql.ts";
import {useParams} from "react-router";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {useQuery} from "@apollo/client";
import {useFragment} from "@/__generated__";
import {FILE_ALL, GET_FILES_BY_FIRMWARE_OBJECT_IDS} from "@/components/graphql/file.graphql.ts";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {buildFileActionColumns} from "@/components/ui/table/action-columns/file-action-columns.tsx";

const columns: ColumnDef<FileAllFragment>[] = [
    ...buildFileActionColumns<FileAllFragment>(),
    {
        id: "id",
        accessorKey: "id",
        header: "ID",
        meta: {hidden: true},
    },
    {
        id: "name",
        accessorKey: "name",
        header: "Name",
    },
    {
        id: "absoluteStorePath",
        accessorKey: "absoluteStorePath",
        header: "Absolute Store Path",
        meta: {hidden: true},
    },
    {
        id: "fileSizeBytes",
        accessorKey: "fileSizeBytes",
        header: "File Size (Bytes)",
        meta: {hidden: true},
    },
    {
        id: "indexedDate",
        accessorKey: "indexedDate",
        header: "Indexed Date",
    },
    {
        id: "isDirectory",
        accessorKey: "isDirectory",
        header: "Is directory?",
    },
    {
        id: "isOnDisk",
        accessorKey: "isOnDisk",
        header: "Is on disk?",
    },
    {
        id: "isSymlink",
        accessorKey: "isSymlink",
        header: "Is symlink?",
    },
    {
        id: "md5",
        accessorKey: "md5",
        header: "MD5",
        meta: {hidden: true},
    },
    {
        id: "metaDict",
        accessorKey: "metaDict",
        header: "Meta Dict",
        meta: {hidden: true},
    },
    {
        id: "parentDir",
        accessorKey: "parentDir",
        header: "Parent Directory",
    },
    {
        id: "partitionName",
        accessorKey: "partitionName",
        header: "Partition Name",
    },
    {
        id: "relativePath",
        accessorKey: "relativePath",
        header: "Relative Path",
        meta: {hidden: true},
    },
    {
        id: "firmwareIdReference.id",
        accessorKey: "firmwareIdReference.id",
        header: "Firmware ID",
        meta: {hidden: true},
    },
];

export function FilesPage() {
    const {firmwareId} = useParams<{ firmwareId?: string }>();

    let firmwareObjectId: string | undefined;
    if (firmwareId) {
        firmwareObjectId = convertIdToObjectId(firmwareId);
    }

    const {
        loading: filesLoading,
        error: filesError,
        data: filesData,
    } = useQuery(GET_FILES_BY_FIRMWARE_OBJECT_IDS, {
        variables: {objectIds: firmwareObjectId},
        fetchPolicy: "cache-first",
    });

    const files = (filesData?.android_firmware_connection?.edges ?? [])
        .flatMap(firmwareEdge => (firmwareEdge?.node?.firmwareFileIdList?.edges ?? []))
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(edge => useFragment(FILE_ALL, edge?.node))
        .filter(isNonNullish);

    return (
        <BasePage title="Files">
            <StateHandlingScrollableDataTable
                columns={columns}
                data={files}
                dataLoading={filesLoading}
                dataError={filesError}
            />
        </BasePage>
    );
}