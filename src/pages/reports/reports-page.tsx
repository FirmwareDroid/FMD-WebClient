import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {useQuery} from "@apollo/client";
import {useFragment} from "@/__generated__";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {GET_REPORT, META_APK_SCANNER_REPORT} from "@/components/graphql/report.graphql.ts";
import {useParams} from "react-router";
import {buildViewReportColumn} from "@/components/data-table-action-columns/report-action-columns.tsx";
import {MetaReportFieldsFragment} from "@/__generated__/graphql.ts";


const columns: ColumnDef<MetaReportFieldsFragment, unknown>[] = [
    buildViewReportColumn<MetaReportFieldsFragment>(),
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
    {
        id: "scanStatus",
        accessorKey: "scanStatus",
        header: "Scan Status",
    }
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

    //const reports = reportsData?.apk_scanner_report_list ?? []
    if (reportsData) {
        console.log(reportsData);
    }

    const reports = (reportsData?.apk_scanner_report_list ?? [])
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(report => {
            if (!report) return null;
            return useFragment(META_APK_SCANNER_REPORT, report);
        })
        .filter(isNonNullish);

    console.log("reports2", reports);

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