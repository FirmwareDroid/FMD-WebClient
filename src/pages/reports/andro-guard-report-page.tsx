import {ImplReportPageProps, ReportLoadingPage} from "@/pages/reports/report-page.tsx";
import {useQuery} from "@apollo/client";
import {
    ANDROGUARD_REPORT,
    GET_SCANNER_REPORT,
} from "@/components/graphql/report.graphql.ts";
import {BasePage} from "@/pages/base-page.tsx";
import {useFragment} from "@/__generated__";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {EntityTable} from "@/components/ui/entity-table.tsx";

export function AndroGuardReportPage({reportId}: Readonly<ImplReportPageProps>) {
    const {
        loading: reportsLoading,
        data: reportsData,
    } = useQuery(GET_SCANNER_REPORT, {
        variables: {reportObjectId: reportId, wantAndroguard: true},
        skip: !reportId,
    });

    if (reportsLoading) {
        return (
            <ReportLoadingPage/>
        );
    }

    const reports = (reportsData?.apk_scanner_report_list ?? [])
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(report => useFragment(ANDROGUARD_REPORT, report?.androidAppIdReference.androguardReport))
        .filter(isNonNullish);

    const report = reports[0];

    return (
        <BasePage title={`Report (${report.scannerName})`}>
            <EntityTable entity={report}/>
        </BasePage>
    );
}