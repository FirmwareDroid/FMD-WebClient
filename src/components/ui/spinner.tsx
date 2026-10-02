import * as React from "react"
import { LoaderCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
    size?: "sm" | "default" | "lg"
    iconClassName?: string
}

export function Spinner({
    className,
    iconClassName,
    size = "default",
    ...props
}: SpinnerProps) {
    const sizeMap = {
        sm: { wrapper: "size-5 p-0.5", icon: "size-3.5" },
        default: { wrapper: "size-6 p-0.5", icon: "size-4" },
        lg: { wrapper: "size-8 p-1", icon: "size-5" },
    }

    const currentSize = sizeMap[size] ?? sizeMap.default

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center shrink-0 overflow-hidden",
                currentSize.wrapper,
                className
            )}
            {...props}
        >
            <LoaderCircleIcon
                className={cn("animate-spin shrink-0", currentSize.icon, iconClassName)}
                aria-hidden="true"
            />
        </span>
    )
}
