import {useEffect} from "react";
import {CircleAlertIcon, CircleCheckIcon, InfoIcon, XIcon} from "lucide-react";
import {useToastStore} from "@/stores/toast.ts";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";

export function ToastRegion() {
    const {toasts, remove} = useToastStore();

    useEffect(() => {
        const timers = toasts.map(toast => window.setTimeout(() => remove(toast), toast.timeout));
        return () => timers.forEach(timer => window.clearTimeout(timer));
    }, [remove, toasts]);

    return (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2" aria-label="Notifications">
            {toasts.map(toast => (
                <div
                    key={toast._id}
                    className={cn(
                        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-background p-4 shadow-lg",
                        toast.type === "error" && "border-destructive",
                    )}
                    role={toast.type === "error" ? "alert" : "status"}
                >
                    {toast.type === "success" ? <CircleCheckIcon className="mt-0.5 size-5 text-green-600" aria-hidden="true"/> : null}
                    {toast.type === "error" ? <CircleAlertIcon className="mt-0.5 size-5 text-destructive" aria-hidden="true"/> : null}
                    {toast.type === "info" || toast.type === "warning" ? <InfoIcon className="mt-0.5 size-5" aria-hidden="true"/> : null}
                    <div className="min-w-0 flex-1 text-sm">
                        {toast.messages.map((message, index) => <p key={`${toast._id.toString()}-${index.toString()}`}>{message}</p>)}
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => remove(toast)} aria-label="Dismiss notification">
                        <XIcon/>
                    </Button>
                </div>
            ))}
        </div>
    );
}
