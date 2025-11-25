import {useQuery} from "@apollo/client";
import {APKID_REPORT, GET_SCANNER_REPORT} from "@/components/graphql/report.graphql.ts";
import {useFragment} from "@/__generated__";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {BasePage} from "@/pages/base-page.tsx";
import {EntityTable} from "@/components/entity-table.tsx";
import {jwtDecode} from "jwt-decode";
import {ImplReportPageProps, ReportLoadingPage} from "@/pages/reports/report-page.tsx";
import {ApkidReportFragment} from "@/__generated__/graphql.ts";

function enrichReport(report: ApkidReportFragment, token: string) {
    const decodedJwtHeader = jwtDecode(token, {header: true});

    return {
        ...report,
        decodedJwtHeader,
    };
}

export function ApkidReportPage({reportId}: Readonly<ImplReportPageProps>) {
    const {
        loading: reportsLoading,
        data: reportsData,
    } = useQuery(GET_SCANNER_REPORT, {
        variables: {reportObjectId: reportId, wantApkid: true},
        skip: !reportId,
    });

    if (reportsLoading) {
        return (
            <ReportLoadingPage/>
        );
    }

    const reports = (reportsData?.apk_scanner_report_list ?? [])
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(report => useFragment(APKID_REPORT, report?.androidAppIdReference.apkidReport))
        .filter(isNonNullish);

    const report = reports[0];

    if (report.results) {
        return (
            <BasePage title={`Report (APKiD)`}>
                <EntityTable entity={enrichReport(report, report.results)}/>
            </BasePage>
        );
    }

    return (
        <BasePage title={`Report (${report.scannerName})`}>
            <EntityTable entity={report}/>
        </BasePage>
    );
}