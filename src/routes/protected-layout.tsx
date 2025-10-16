import {useAuth} from "@/lib/auth.tsx";
import {Navigate, Outlet, useLocation} from "react-router";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";
import {SiteHeader} from "@/components/ui/sidebar/site-header.tsx";
import {AppSidebar, EMULATOR_URL} from "@/components/ui/sidebar/app-sidebar.tsx";

export default function ProtectedLayout() {
    const {isAuthenticated, initializing} = useAuth();
    const location = useLocation();

    if (initializing) return null;
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>
    }

    const isEmulatorPage = location.pathname.startsWith(EMULATOR_URL);

    return (
        <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
                {!isEmulatorPage && <SiteHeader/>}
                <div className="flex flex-1 overflow-x-hidden">
                    {!isEmulatorPage && <AppSidebar/>}
                    <SidebarInset>
                        <Outlet/>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}