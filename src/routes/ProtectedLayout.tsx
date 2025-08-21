import {useAuth} from "@/lib/auth.tsx";
import {Navigate, Outlet, useLocation} from "react-router";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";
import {SiteHeader} from "@/components/ui/sidebar/site-header.tsx";
import {AppSidebar} from "@/components/ui/sidebar/app-sidebar.tsx";

export default function ProtectedLayout() {
    const {isAuthenticated, initializing} = useAuth();
    const location = useLocation();

    if (initializing) return null;
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>
    }

    return (
        <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeader/>
                <div className="flex flex-1">
                    <AppSidebar/>
                    <SidebarInset>
                        <Outlet/>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}