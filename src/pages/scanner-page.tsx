import {BasePage} from "@/pages/base-page.tsx";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable.tsx";
import {TypographyH4} from "@/components/ui/typography/headings.tsx";
import {CheckboxForm} from "@/components/ui/checkbox-form.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {useQuery} from "@apollo/client";
import {
    FIRMWARE_TABLE_ROW_SCANNER,
    GET_FIRMWARE_OBJECT_ID_LIST,
    GET_FIRMWARES_BY_OBJECT_IDS_SCANNER
} from "@/components/graphql/firmware.graphql.ts";
import {useMemo} from "react";
import {
    AppTableRowScannerFragment,
    FirmwareTableRowScannerFragment
} from "@/__generated__/graphql.ts";
import {nonNullable} from "@/lib/non-nullable.ts";
import {useFragment} from "@/__generated__";
import {
    APP_TABLE_ROW_SCANNER,
    GET_APP_OBJECT_IDS_BY_FIRMWARE_OBJECT_IDS,
    GET_APPS_BY_OBJECT_IDS_SCANNER
} from "@/components/graphql/app.graphql.ts";

export function ScannerPage() {
    return (
        <BasePage title="App Scanner">
            <ResizablePanelGroup direction="horizontal" className="border-t border-b">
                <ResizablePanel defaultSize={40}>
                    <FirmwaresPanel/>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={40}>
                    <AppsPanel/>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={20}>
                    <ScannersPanel/>
                </ResizablePanel>
            </ResizablePanelGroup>
        </BasePage>
    );
}

function FirmwaresPanel() {
    const columns: ColumnDef<FirmwareTableRowScannerFragment>[] = [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
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
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                    }}
                    aria-label="Select row"
                />
            ),
        },
        {
            id: "id",
            header: "ID",
        },
        {
            accessorKey: "originalFilename",
            header: "Original Filename",
        },
    ];

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
    } = useQuery(GET_FIRMWARES_BY_OBJECT_IDS_SCANNER, {
        variables: {objectIds},
        skip: objectIds.length === 0,
    });

    const firmwares: FirmwareTableRowScannerFragment[] = useMemo(
        () =>
            ((firmwaresData?.android_firmware_list ?? [])
                    .filter(nonNullable)
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    .map((item) => useFragment(FIRMWARE_TABLE_ROW_SCANNER, item))
                    .filter(nonNullable)
            ),
        [firmwaresData]
    );

    return (
        <div className="flex flex-col p-4 gap-4">
            <TypographyH4>Firmwares</TypographyH4>
            <StateHandlingScrollableDataTable
                columns={columns}
                data={firmwares}
                idsLoading={idsLoading}
                dataLoading={firmwaresLoading}
                idsError={idsError}
                dataError={firmwaresError}
            />
        </div>
    );
}

function AppsPanel() {
    const columns: ColumnDef<AppTableRowScannerFragment>[] = [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
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
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                    }}
                    aria-label="Select row"
                />
            ),
        },
        {
            accessorKey: "id",
            header: "ID",
        }
    ];

    const {
        loading: idsLoading,
        error: idsError,
        data: idsData,
    } = useQuery(GET_APP_OBJECT_IDS_BY_FIRMWARE_OBJECT_IDS);

    const objectIds = useMemo(() =>
            (idsData?.android_app_id_list ?? []).filter(Boolean) as string[],
        [idsData]
    );

    const {
        loading: appsLoading,
        error: appsError,
        data: appsData,
    } = useQuery(GET_APPS_BY_OBJECT_IDS_SCANNER, {
        variables: {objectIds},
        skip: objectIds.length === 0,
    });

    const apps: AppTableRowScannerFragment[] = useMemo(
        () =>
            ((appsData?.android_app_list ?? [])
                    .filter(nonNullable)
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    .map((item) => useFragment(APP_TABLE_ROW_SCANNER, item))
                    .filter(nonNullable)
            ),
        [appsData]
    );

    return (
        <div className="flex flex-col p-4 gap-4">
            <TypographyH4>Apps</TypographyH4>
            <StateHandlingScrollableDataTable
                columns={columns}
                data={apps}
                idsLoading={idsLoading}
                idsError={idsError}
                dataLoading={appsLoading}
                dataError={appsError}
            />
        </div>
    );
}

function ScannersPanel() {
    const scanners = [
        "AndroGuard",
        "APKiD",
        "APKLeaks",
        "APKscan",
        "Exodus-Core",
        "FlowDroid",
        "MobSFScan",
        "Trueseeing",
        "Quark-Engine",
        "Qark",
        "Androwarn",
        "SUPER Android Analyzer",
    ];

    return (
        <div className="flex flex-col p-4 gap-4">
            <TypographyH4>Scanners</TypographyH4>
            <CheckboxForm
                items={scanners.map((scanner) => ({
                    id: scanner,
                    label: scanner,
                }))}
                validateOnMount={true}
                validationMode="onChange"
            />
        </div>
    );
}