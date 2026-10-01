import {ReactNode} from "react";
import {cn} from "@/lib/utils.ts";

type props = {
    children: ReactNode,
    className?: string,
}

function TypographyH1({children, className}: Readonly<props>) {
    return (
        <h1 className={cn("scroll-m-20 text-3xl font-extrabold tracking-[-0.04em] text-balance sm:text-4xl", className)}>
            {children}
        </h1>
    )
}

function TypographyH2({children, className}: Readonly<props>) {
    return (
        <h2 className={cn("scroll-m-20 text-2xl font-extrabold tracking-[-0.035em] first:mt-0 sm:text-3xl", className)}>
            {children}
        </h2>
    )
}

export {
    TypographyH1,
    TypographyH2,
}
