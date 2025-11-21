import {Route, Routes} from "react-router";
import LoginPage from "@/pages/login-page.tsx";
import PublicOnlyRoute from "@/routes/public-only-route.tsx";
import ProtectedLayout from "@/routes/protected-layout.tsx";
import HomePage from "@/pages/home-page.tsx";
import {ImporterPage} from "@/pages/importer-page.tsx";
import {ScanJobsPage} from "@/pages/scan-jobs-page.tsx";
import {FirmwaresPage} from "@/pages/firmwares-page.tsx";
import {FirmwarePage} from "@/pages/firmware-page.tsx";
import {AppsPage} from "@/pages/apps-page.tsx";
import {AppPage} from "@/pages/app-page.tsx";
import {FilePage} from "@/pages/file-page.tsx";
import {FilesPage} from "@/pages/files-page.tsx";
import {NotFoundPage} from "@/pages/not-found-page.tsx";
import {ReportsPage} from "@/pages/reports/reports-page.tsx";
import {ReportPage} from "@/pages/reports/report-page.tsx";
import {
    APPS_URL,
    EMULATOR_URL,
    FILES_URL,
    FIRMWARE_URL,
    IMPORTER_URL,
    REPORTS_URL,
    SCAN_JOBS_URL
} from "@/components/ui/sidebar/app-sidebar.tsx";
//import EmulatorPage from "@/pages/EmulatorPage";
import {EmulatorPage} from "@/pages/emulator-page.tsx";

function App() {
    return (
        <Routes>
            <Route element={<PublicOnlyRoute/>}>
                <Route path="/login" element={<LoginPage/>}/>
            </Route>

            <Route element={<ProtectedLayout/>}>
                <Route path="/" element={<HomePage/>}/>
                <Route path={IMPORTER_URL} element={<ImporterPage/>}/>
                <Route path={SCAN_JOBS_URL} element={<ScanJobsPage/>}/>
                <Route path={EMULATOR_URL} element={<EmulatorPage/>}/>
                <Route path={FIRMWARE_URL} element={<FirmwaresPage/>}/>
                <Route path={`${FIRMWARE_URL}/:firmwareId`} element={<FirmwarePage/>}/>
                <Route path={`${FIRMWARE_URL}/:firmwareId${APPS_URL}`} element={<AppsPage/>}/>
                <Route path={`${FIRMWARE_URL}/:firmwareId${APPS_URL}/:appId`} element={<AppPage/>}/>
                <Route path={`${FIRMWARE_URL}/:firmwareId${APPS_URL}/:appId${REPORTS_URL}`} element={<ReportsPage/>}/>
                <Route path={`${FIRMWARE_URL}/:firmwareId${APPS_URL}/:appId${REPORTS_URL}/:scannerNameAndReportId`} element={<ReportPage/>}/>
                <Route path={`${FIRMWARE_URL}/:firmwareId${FILES_URL}`} element={<FilesPage/>}/>
                <Route path={`${FIRMWARE_URL}/:firmwareId${FILES_URL}/:fileId`} element={<FilePage/>}/>
                <Route path={APPS_URL} element={<AppsPage/>}/>
                <Route path={REPORTS_URL} element={<ReportsPage/>}/>
                <Route path="*" element={<NotFoundPage/>}/>
            </Route>
        </Routes>
    );
}

export default App
