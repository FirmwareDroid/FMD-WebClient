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
        <main className={cn("px-4 py-8 sm:px-6 sm:py-10 lg:px-10", className)}>
            <div className="w-full max-w-6xl mx-auto">
                <header className="mb-7 border-b pb-6">
                    <p className="fmd-kicker mb-2">
                        <span className="text-[#8bd450] font-bold">FMD</span> workspace
                    </p>
                    <TypographyH1>{title}</TypographyH1>
                </header>

                <div className="flex flex-col items-center gap-6 sm:gap-8">
                    {children}
                </div>
            </div>
        </main>
    );
}
