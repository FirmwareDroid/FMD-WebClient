import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {FileAllFragment} from "@/__generated__/graphql.ts";
import {useParams} from "react-router";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {useQuery} from "@apollo/client";
import {useFragment} from "@/__generated__";
import {FILE_ALL, GET_FILES_BY_FIRMWARE_OBJECT_IDS} from "@/components/graphql/file.graphql.ts";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {buildFileActionColumns} from "@/components/ui/entity-action-columns.tsx";

const columns: ColumnDef<FileAllFragment>[] = [
    ...buildFileActionColumns<FileAllFragment>(),
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "absoluteStorePath",
        header: "Absolute Store Path",
    },
    // {
    //     accessorKey: "fileSizeBytes",
    //     header: "File Size (Bytes)",
    // },
    {
        accessorKey: "indexedDate",
        header: "Indexed Date",
    },
    {
        accessorKey: "isDirectory",
        header: "Is directory?",
    },
    {
        accessorKey: "isOnDisk",
        header: "Is on disk?",
    },
    {
        accessorKey: "isSymlink",
        header: "Is symlink?",
    },
    {
        accessorKey: "md5",
        header: "MD5",
    },
    {
        accessorKey: "metaDict",
        header: "Meta Dict",
    },
    {
        accessorKey: "parentDir",
        header: "Parent Directory",
    },
    {
        accessorKey: "partitionName",
        header: "Partition Name",
    },
    {
        accessorKey: "relativePath",
        header: "Relative Path",
    },
    {
        accessorKey: "firmwareIdReference.id",
        header: "Firmware ID",
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