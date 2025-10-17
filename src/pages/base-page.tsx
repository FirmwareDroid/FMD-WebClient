import {ReactNode} from "react";
import {TypographyH1} from "@/components/typography/headings.tsx";
import {cn} from "@/lib/utils.ts";

type Props = {
    className?: string;
    children: ReactNode,
    title: string,
}

export function BasePage(
    {
        className,
        children,
        title,
    }: Readonly<Props>) {
    return (
        <div className={cn("p-4", className)}>
            <TypographyH1 className="mb-4">{title}</TypographyH1>
            <div className="flex flex-col items-center gap-8">
                {children}
            </div>
        </div>
    );
}