import {useAuth} from "@/lib/auth.tsx";
import {Navigate, Outlet} from "react-router";

export default function PublicOnlyRoute() {
    const {isAuthenticated, initializing} = useAuth();

    if (initializing) return null;
    if (isAuthenticated) return <Navigate to="/" replace/>;

    return <Outlet/>;
}