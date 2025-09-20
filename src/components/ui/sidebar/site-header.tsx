"use client"

import {SidebarIcon} from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx"
import {Button} from "@/components/ui/button.tsx"
import {Separator} from "@/components/ui/separator.tsx"
import {useSidebar} from "@/components/ui/sidebar.tsx"
import {ModeToggle} from "@/components/ui/theming/mode-toggle.tsx";
import {Link, useLocation, useParams} from "react-router";

export function SiteHeader() {
    const {toggleSidebar} = useSidebar();
    const location = useLocation();
    const {firmwareId} = useParams<{ firmwareId?: string }>();
    const isFirmwareDetail = location.pathname.startsWith("/firmwares/") && firmwareId;

    return (
        <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
            <div className="flex justify-between w-full items-center pl-2 pr-4">
                <div className="flex h-(--header-height) w-full items-center gap-2">
                    <Button
                        className="h-8 w-8"
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                    >
                        <SidebarIcon/>
                    </Button>

                    <Separator orientation="vertical" className="mr-2 h-4"/>

                    <Breadcrumb className="hidden sm:block">
                        {isFirmwareDetail && (
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link to="/firmwares">Firmwares</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{firmwareId}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        )}
                    </Breadcrumb>
                </div>
                <ModeToggle/>
            </div>
        </header>
    )
}
