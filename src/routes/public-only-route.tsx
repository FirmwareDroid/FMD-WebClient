import {useAuth} from "@/lib/auth.tsx";
import {Navigate, Outlet} from "react-router";

export default function PublicOnlyRoute() {
    const {isAuthenticated, initializing} = useAuth();

    if (initializing) return <div className="flex min-h-svh items-center justify-center" role="status">Checking your session…</div>;
    if (isAuthenticated) return <Navigate to="/" replace/>;

    return <Outlet/>;
}
