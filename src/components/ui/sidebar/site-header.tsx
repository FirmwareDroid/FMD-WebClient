"use client"

import {HomeIcon, SidebarIcon} from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx"
import {Button} from "@/components/ui/button.tsx"
import {Separator} from "@/components/ui/separator.tsx"
import {useSidebar} from "@/components/ui/sidebar.tsx"
import {Link, useLocation} from "react-router";
import {FmdIcon} from "@/components/icons/fmd-icon.tsx";
import {useBreadcrumbStore} from "@/lib/breadcrumb-store.ts";
import {formatBreadcrumbSegment} from "@/lib/breadcrumb-utils.ts";

export function SiteHeader() {
    const {toggleSidebar} = useSidebar();
    const pathname = useLocation().pathname;
    const splitPathname = pathname.split("/").filter(item => item.length > 0);
    const breadcrumbTitles = useBreadcrumbStore((state) => state.titles);

    return (
        <header className="sticky top-0 z-50 flex w-full items-center border-b border-[#263649] bg-[#07111f]/95 text-white backdrop-blur">
            <div className="flex justify-between w-full items-center pl-2 pr-4">
                <div className="flex h-(--header-height) w-full items-center gap-2">
                    <Button
                        className="h-8 w-8 text-slate-200 hover:bg-[#13273a] hover:text-[#8bd450]"
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        aria-label="Toggle navigation sidebar"
                    >
                        <SidebarIcon/>
                    </Button>

                    <Separator orientation="vertical" className="mr-2 h-4 bg-[#34465a]"/>

                    <Link to="/" className="fmd-wordmark mr-3 whitespace-nowrap text-sm sm:hidden inline-flex items-center gap-1.5">
                        <FmdIcon className="size-5 rounded" />
                        <span className="text-[#8bd450] font-bold">FMD</span>
                    </Link>

                    {splitPathname.length > 0 && (
                        <Breadcrumb className="hidden sm:block">
                            <BreadcrumbList className="text-slate-400">
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link
                                            to="/"
                                            className="hover:text-white inline-flex items-center gap-1"
                                            title="Home"
                                        >
                                            <HomeIcon className="size-3.5" />
                                            <span>Home</span>
                                        </Link>
                                    </BreadcrumbLink>
                                    <BreadcrumbSeparator/>
                                </BreadcrumbItem>

                                {splitPathname.map((item, index) => {
                                    const {label, tooltip} = formatBreadcrumbSegment(item, breadcrumbTitles);
                                    const isLast = index === splitPathname.length - 1;
                                    const targetPath = `/${splitPathname.slice(0, index + 1).join("/")}`;

                                    return (
                                        <BreadcrumbItem key={`${item}-${index.toString()}`}>
                                            <BreadcrumbLink asChild>
                                                <Link
                                                    to={targetPath}
                                                    className={`hover:text-white max-w-[220px] truncate inline-block align-bottom ${isLast ? "text-slate-200 font-medium" : ""}`}
                                                    title={tooltip || label}
                                                >
                                                    {label}
                                                </Link>
                                            </BreadcrumbLink>
                                            {!isLast && <BreadcrumbSeparator/>}
                                        </BreadcrumbItem>
                                    );
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}
                </div>

            </div>
        </header>
    )
}
