import {BasePage} from "@/pages/base-page.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {useLocation} from "react-router";
import {AlertCircleIcon} from "lucide-react";

export function NotFoundPage() {
    const location = useLocation();

    return  (
        <BasePage title="Error">
            <Alert variant="destructive">
                <AlertCircleIcon/>
                <AlertTitle>Page not found</AlertTitle>
                <AlertDescription>Failed to find page at {location.pathname}</AlertDescription>
            </Alert>
        </BasePage>
    );
}