import {lazy, Suspense} from "react";
import {Route, Routes} from "react-router";
import PublicOnlyRoute from "@/routes/public-only-route.tsx";
import ProtectedLayout from "@/routes/protected-layout.tsx";
import {
    APPS_URL,
    EMULATOR_URL,
    FILES_URL,
    FIRMWARE_URL,
    IMPORTER_URL,
    REPORTS_URL,
    SCAN_JOBS_URL
} from "@/components/ui/sidebar/app-sidebar.tsx";

const LoginPage = lazy(() => import("@/pages/login-page.tsx"));
const HomePage = lazy(() => import("@/pages/home-page.tsx"));
const ImporterPage = lazy(() => import("@/pages/importer-page.tsx").then(module => ({default: module.ImporterPage})));
const ScanJobsPage = lazy(() => import("@/pages/scan-jobs-page.tsx").then(module => ({default: module.ScanJobsPage})));
const FirmwaresPage = lazy(() => import("@/pages/firmwares-page.tsx").then(module => ({default: module.FirmwaresPage})));
const FirmwarePage = lazy(() => import("@/pages/firmware-page.tsx").then(module => ({default: module.FirmwarePage})));
const AppsPage = lazy(() => import("@/pages/apps-page.tsx").then(module => ({default: module.AppsPage})));
const AppPage = lazy(() => import("@/pages/app-page.tsx").then(module => ({default: module.AppPage})));
const FilePage = lazy(() => import("@/pages/file-page.tsx").then(module => ({default: module.FilePage})));
const FilesPage = lazy(() => import("@/pages/files-page.tsx").then(module => ({default: module.FilesPage})));
const NotFoundPage = lazy(() => import("@/pages/not-found-page.tsx").then(module => ({default: module.NotFoundPage})));
const ReportsPage = lazy(() => import("@/pages/reports/reports-page.tsx").then(module => ({default: module.ReportsPage})));
const ReportPage = lazy(() => import("@/pages/reports/report-page.tsx").then(module => ({default: module.ReportPage})));
const EmulatorPage = lazy(() => import("@/pages/emulator-page.tsx").then(module => ({default: module.EmulatorPage})));

function RouteFallback() {
    return <div className="flex min-h-64 items-center justify-center p-6" role="status" aria-live="polite">Loading page…</div>;
}

function App() {
    return (
        <Suspense fallback={<RouteFallback/>}>
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
        </Suspense>
    );
}

export default App
