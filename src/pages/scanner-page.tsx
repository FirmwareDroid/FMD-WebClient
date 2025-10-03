import {BasePage} from "@/pages/base-page.tsx";
import {RqJobsTable} from "@/components/ui/rq-jobs-table.tsx";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon} from "lucide-react";
import {useNavigate} from "react-router";

export function ScannerPage() {
    const navigate = useNavigate();

    return (
        <BasePage title="Recent App Scan Jobs">
            <Alert className="flex items-center justify-center max-w-5xl">
                <AlertCircleIcon/>
                <AlertTitle className="flex flex-wrap items-center justify-center gap-1 text-center sm:text-left">
                    If you wish to start new scans, navigate to the
                    <a onClick={() => void navigate("/firmwares")} className="text-blue-600 hover:underline cursor-pointer">Firmwares</a>
                    or
                    <a onClick={() => void navigate("/apps")} className="text-blue-600 hover:underline cursor-pointer">Apps</a>
                    page.
                </AlertTitle>
            </Alert>
            <div className="flex items-center justify-center w-full max-w-7xl">
                <RqJobsTable funcNames={["start_scan"]}/>
            </div>
        </BasePage>
    );
}
