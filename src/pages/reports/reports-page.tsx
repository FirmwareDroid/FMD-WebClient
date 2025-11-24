import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {useQuery} from "@apollo/client";
import {useFragment} from "@/__generated__";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {
    GET_REPORT,
    BASIC_REPORT_INFO
} from "@/components/graphql/report.graphql.ts";
import {useParams} from "react-router";
import {buildViewReportColumn} from "@/components/data-table-action-columns/report-action-columns.tsx";
import {BasicReportInfoFragment} from "@/__generated__/graphql.ts";

const columns: ColumnDef<BasicReportInfoFragment>[] = [
    buildViewReportColumn<BasicReportInfoFragment>(),
    {
        id: "id",
        accessorKey: "id",
        header: "ID",
        meta: {hidden: true},
    },
    {
        id: "scannerName",
        accessorKey: "scannerName",
        header: "Scanner Name",
    },
    {
        id: "scannerVersion",
        accessorKey: "scannerVersion",
        header: "Scanner Version",
    },
    {
        id: "reportDate",
        accessorKey: "reportDate",
        header: "Report Date",
    },
    {
        id: "androidAppIdReference.filename",
        accessorKey: "androidAppIdReference.filename",
        header: "App Filename",
    },
];

export function ReportsPage() {
    const {appId} = useParams<{ appId?: string }>();

    let appObjectId: string | undefined;
    if (appId) {
        appObjectId = convertIdToObjectId(appId);
    }

    const {
        loading: reportsLoading,
        error: reportsError,
        data: reportsData,
    } = useQuery(GET_REPORT, {
        variables: {appObjectId: appObjectId},
        fetchPolicy: "cache-first",
    });

    const reports = (reportsData?.apk_scanner_report_list ?? [])
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(report => useFragment(BASIC_REPORT_INFO, report))
        .filter(isNonNullish);

    return (
        <BasePage title={"Reports"}>
            <StateHandlingScrollableDataTable
                columns={columns}
                data={reports}
                dataLoading={reportsLoading}
                dataError={reportsError}
            />
        </BasePage>
    );
}