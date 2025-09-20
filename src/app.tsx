import {Navigate, Route, Routes} from "react-router";
import LoginPage from "@/pages/login-page.tsx";
import PublicOnlyRoute from "@/routes/public-only-route.tsx";
import ProtectedLayout from "@/routes/protected-layout.tsx";
import HomePage from "@/pages/home-page.tsx";
import EmulatorPage from "@/pages/EmulatorPage";
import {ImporterPage} from "@/pages/importer-page.tsx";
import {ScannerPage} from "@/pages/scanner-page.tsx";
import {FirmwaresPage} from "@/pages/firmwares-page.tsx";
import {FirmwarePage} from "@/pages/firmware-page.tsx";

function App() {
    return (
        <Routes>
            <Route element={<PublicOnlyRoute/>}>
                <Route path="/login" element={<LoginPage/>}/>
            </Route>

            <Route element={<ProtectedLayout/>}>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/importer" element={<ImporterPage/>}/>
                <Route path="/scanner" element={<ScannerPage/>}/>
                <Route path="/emulator" element={<EmulatorPage/>}/>
                <Route path="/firmwares" element={<FirmwaresPage/>}/>
                <Route path="/firmwares/:firmwareId" element={<FirmwarePage/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
                {/*<Route path="*" element={<NotFoundPage/>}/>*/} {/*TOOD: Add 404 page?*/}
            </Route>
        </Routes>
    );
}

export default App
