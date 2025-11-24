import {ReactNode} from "react";
import {cn} from "@/lib/utils.ts";

type props = {
    children: ReactNode,
    className?: string,
}

function TypographyH1({children, className}: Readonly<props>) {
    return (
        <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight text-balance", className)}>
            {children}
        </h1>
    )
}

function TypographyH2({children, className}: Readonly<props>) {
    return (
        <h2 className={cn("scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0", className)}>
            {children}
        </h2>
    )
}

export {
    TypographyH1,
    TypographyH2,
}
