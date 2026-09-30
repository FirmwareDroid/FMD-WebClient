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
        <main className={cn("px-4 py-6 sm:px-6 lg:px-8", className)}>
            <div className="w-full max-w-5xl mx-auto">
                <TypographyH1 className="mb-4">{title}</TypographyH1>

                <div className="flex flex-col items-center gap-6 sm:gap-8">
                    {children}
                </div>
            </div>
        </main>
    );
}
