import {ImplReportPageProps, ReportLoadingPage} from "@/pages/reports/report-page.tsx";
import {useQuery} from "@apollo/client";
import {
    GET_SCANNER_REPORT, VIRUSTOTAL_REPORT
} from "@/components/graphql/report.graphql.ts";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {BasePage} from "@/pages/base-page.tsx";
import {EntityTable} from "@/components/entity-table.tsx";
import {useFragment} from "@/__generated__";

export function VirusTotalReportPage({reportId}: Readonly<ImplReportPageProps>) {
    const {
        loading: reportsLoading,
        data: reportsData,
    } = useQuery(GET_SCANNER_REPORT, {
        variables: {reportObjectId: reportId, wantVirusTotal: true},
        skip: !reportId,
    });

    if (reportsLoading) {
        return (
            <ReportLoadingPage/>
        );
    }

    const reports = (reportsData?.apk_scanner_report_list ?? [])
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(report => useFragment(VIRUSTOTAL_REPORT, report?.androidAppIdReference.virustotalReport))
        .filter(isNonNullish);

    const report = reports[0];

    return (
        <BasePage title={`Report (${report.scannerName})`}>
            <EntityTable entity={report}/>
        </BasePage>
    );
}