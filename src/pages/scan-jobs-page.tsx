import {BasePage} from "@/pages/base-page.tsx";
import {RqJobsTable} from "@/components/rq-jobs-table.tsx";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon} from "lucide-react";
import {Link} from "react-router";
import {APPS_URL, FIRMWARE_URL, REPORTS_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {ApkScannerLogView} from "@/components/apk-scanner-log-view/apk-scanner-log-view.tsx";

export function ScanJobsPage() {
    return (
        <BasePage title="Recent App Scan Jobs">
            <Card className="w-full max-w-5xl">
                <CardContent>
                    <p className="text-body">
                        This page displays a list of recent app scan jobs that have been initiated
                        or are currently running. More information about each job, including its status,
                        start time, errors, debug-info, and results, can be found as well in the
                        {' '}<a className="ui-link" href="/django-rq">RQ-Backend</a>.
                        Scanning results are available in the
                        {' '}<Link className="ui-link" to={REPORTS_URL}>Scan Reports</Link>{' '}
                        section of the corresponding app.
                    </p>
                </CardContent>
            </Card>
            <div className="flex items-center justify-center w-full max-w-7xl">
                <ApkScannerLogView />
            </div>
            <Alert className="flex items-center justify-center max-w-5xl">
                <AlertCircleIcon/>
                <AlertTitle className="flex flex-wrap items-center justify-center gap-1 text-center sm:text-left">
                    If you wish to start new scans, navigate to the
                    <Link to={FIRMWARE_URL} className="ui-link">Firmware</Link>
                    or
                    <Link to={APPS_URL} className="ui-link">Apps</Link>
                    page.
                </AlertTitle>
            </Alert>
            <div className="flex items-center justify-center w-full max-w-7xl">
                <RqJobsTable funcNames={["start_scan"]}/>
            </div>
        </BasePage>
    );
}
