import {TypographyH2} from "@/components/ui/typography/headings.tsx";
import {BasePage} from "@/pages/base-page.tsx";
import {Dropzone} from "@/components/ui/importer/dropzone.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useMutation, useQuery} from "@apollo/client";
import {
    CREATE_FIRMWARE_EXTRACTOR_JOB, DELETE_FIRMWARE_BY_OBJECT_ID,
    FIRMWARE_TABLE_ROW_IMPORTER, GET_FIRMWARE_OBJECT_ID_LIST,
    GET_FIRMWARES_BY_OBJECT_IDS_IMPORTER,
} from "@/components/graphql/firmware.graphql.ts";
import {Alert} from "@/components/ui/alert.tsx";
import {AlertCircleIcon, LoaderCircle, Trash} from "lucide-react";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {useMemo} from "react";
import {nonNullable} from "@/lib/non-nullable.ts";
import {useFragment} from "@/__generated__";

import type {ColumnDef} from "@tanstack/react-table";
import type {FirmwareTableRowImporterFragment} from "@/__generated__/graphql.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";

export function ImporterPage() {
    const [createFirmwareExtractorJob, {loading: extractorJobLoading}] = useMutation(CREATE_FIRMWARE_EXTRACTOR_JOB);

    const {
        data: idsData,
        loading: idsLoading,
        error: idsError,
    } = useQuery(GET_FIRMWARE_OBJECT_ID_LIST);

    const objectIds = useMemo(() =>
            (idsData?.android_firmware_id_list ?? []).filter(Boolean) as string[],
        [idsData]
    );

    const {
        data: firmwaresData,
        loading: firmwaresLoading,
        error: firmwaresError,
    } = useQuery(GET_FIRMWARES_BY_OBJECT_IDS_IMPORTER, {
        variables: {objectIds},
        skip: objectIds.length === 0,
    });

    const firmwares: FirmwareTableRowImporterFragment[] = useMemo(
        () =>
            ((firmwaresData?.android_firmware_list ?? [])
                    .filter(nonNullable)
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    .map((item) => useFragment(FIRMWARE_TABLE_ROW_IMPORTER, item))
                    .filter(nonNullable)
            ),
        [firmwaresData]
    );

    return (
        <BasePage title="Firmware Import">
            <TypographyH2>Upload Firmwares</TypographyH2>
            <Dropzone
                className="max-w-5xl w-full"
                message="Drag 'n' drop some firmware files here, or click to select files"
            />
            <Button
                onClick={() => void createFirmwareExtractorJob({variables: {storageIndex: 0}})}
                disabled={extractorJobLoading}
            >
                Extract Firmwares
            </Button>
            <Separator></Separator>
            <TypographyH2>Extracted Firmwares</TypographyH2>
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

const columns: ColumnDef<FirmwareTableRowImporterFragment>[] = [
    {
        id: "select",
        header: ({table}) => (
            <Checkbox
                className="flex items-center"
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => {
                    table.toggleAllPageRowsSelected(!!value);
                }}
                aria-label="Select all"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                className="flex items-center"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => {
                    row.toggleSelected(!!value);
                }}
                aria-label="Select row"
            />
        ),
    },
    {
        id: "delete",
        cell: ({row}) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [deleteFirmware, {loading, error}] = useMutation(
                DELETE_FIRMWARE_BY_OBJECT_ID, {
                    variables: {
                        objectIds: convertIdToObjectId(row.getValue("id"))
                    }
                }
            );

            if (loading) {
                return (
                    <LoaderCircle className="animate-spin"></LoaderCircle>
                );
            }

            if (error) {
                return (
                    <Alert variant="destructive">
                        <AlertCircleIcon/>
                    </Alert>
                );
            }

            return (
                <Button onClick={() => void deleteFirmware()} variant="destructive">
                    <Trash></Trash>
                </Button>
            );
        },
    },
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "originalFilename",
        header: "Original Filename",
    },
    {
        accessorKey: "indexedDate",
        header: "Indexed Date",
        cell: ({row}) => {
            const padStart = (value: number): string =>
                value.toString().padStart(2, "0");

            const date: Date = new Date(row.getValue("indexedDate"));
            return `${date.getFullYear().toString()}-${padStart(date.getMonth() + 1)}-${padStart(date.getDate())} ${padStart(date.getHours())}:${padStart(date.getMinutes())}`;
        }
    },
    {
        accessorKey: "osVendor",
        header: "OS Vendor",
    },
    {
        accessorKey: "versionDetected",
        header: "Android Version",
    },
];
