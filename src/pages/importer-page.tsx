import {TypographyH2} from "@/components/typography/headings.tsx";
import {BasePage} from "@/pages/base-page.tsx";
import {Dropzone} from "@/components/importer/dropzone.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {useQuery} from "@apollo/client";
import {
    FIRMWARE_ROW_IMPORTER_PAGE, GET_FIRMWARES_IMPORTER_PAGE, SCAN_APKS_BY_FIRMWARE_OBJECT_IDS,
} from "@/components/graphql/firmware.graphql.ts";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {useFragment} from "@/__generated__";

import type {ColumnDef} from "@tanstack/react-table";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {FirmwareRowImporterPageFragment} from "@/__generated__/graphql.ts";
import {buildFirmwareActionColumns} from "@/components/data-table-action-columns/firmware-action-columns.tsx";
import {useEffect, useState} from "react";
import {CursorPaginationProps} from "@/components/ui/table/cursor-pagination.tsx";

const columns: ColumnDef<FirmwareRowImporterPageFragment>[] = [
    ...buildFirmwareActionColumns<FirmwareRowImporterPageFragment>(SCAN_APKS_BY_FIRMWARE_OBJECT_IDS),
    {
        id: "id",
        accessorKey: "id",
        header: "ID",
        meta: {hidden: true},
    },
    {
        id: "originalFilename",
        accessorKey: "originalFilename",
        header: "Original Filename",
    },
    {
        id: "indexedDate",
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
        id: "osVendor",
        accessorKey: "osVendor",
        header: "OS Vendor",
    },
    {
        id: "versionDetected",
        accessorKey: "versionDetected",
        header: "Android Version",
    },
];

export function ImporterPage() {
    const [pageSize, setPageSize] = useState<number>(25);
    const [afterStack, setAfterStack] = useState<(string | null)[]>([null]);
    const after = afterStack.at(-1);

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery(GET_FIRMWARES_IMPORTER_PAGE, {
        variables: {
            first: pageSize,
            after,
        },
        fetchPolicy: "cache-first",
        notifyOnNetworkStatusChange: true,
    });

    const pageInfo = data?.android_firmware_connection?.pageInfo;
    const edges = data?.android_firmware_connection?.edges ?? [];

    const firmwares = edges
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(edge => useFragment(FIRMWARE_ROW_IMPORTER_PAGE, edge?.node))
        .filter(isNonNullish);

    const goNext = () => {
        if (!pageInfo?.hasNextPage) return;
        setAfterStack(prev => [...prev, pageInfo.endCursor ?? null]);
    };

    const goPrevious = () => {
        if (afterStack.length <= 1) return;
        setAfterStack(prev => prev.slice(0, -1));
    };

    useEffect(() => {
        void refetch({first: pageSize, after});
    }, [pageSize, after, refetch]);

    const onPageSizeChange = (n: number) => {
        setAfterStack([null]);
        setPageSize(n);
    }

    const cursorPagination: CursorPaginationProps = {
        pageSize: pageSize,
        onPageSizeChange: onPageSizeChange,
        hasPrevious: afterStack.length > 1,
        hasNext: Boolean(pageInfo?.hasNextPage),
        onPrevious: goPrevious,
        onNext: goNext,
    }

    return (
        <BasePage title="Importer">
            <TypographyH2>Import Firmwares and APKs</TypographyH2>
            <Dropzone className="max-w-5xl w-full"/>
            <Separator></Separator>
            <TypographyH2>Extracted Firmwares</TypographyH2>
            <StateHandlingScrollableDataTable
                columns={columns}
                data={firmwares}
                dataLoading={loading}
                dataError={error}
                cursorPagination={cursorPagination}
            />
        </BasePage>
    );
}
