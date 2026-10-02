import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";

interface CopyButtonProps {
    value: string;
    label?: string;
    className?: string;
}

export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy to clipboard:", err);
        }
    };

    return (
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`size-7 text-muted-foreground hover:text-foreground shrink-0 ${className ?? ""}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        void handleCopy();
                    }}
                    aria-label={copied ? "Copied" : label}
                >
                    {copied ? (
                        <CheckIcon className="size-3.5 text-green-600" aria-hidden="true" />
                    ) : (
                        <CopyIcon className="size-3.5" aria-hidden="true" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{copied ? "Copied!" : label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
