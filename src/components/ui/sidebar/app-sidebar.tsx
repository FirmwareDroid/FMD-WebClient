import * as React from "react"
import {
    BookOpenIcon,
    BugIcon,
    CpuIcon,
    ImportIcon,
    ScanSearchIcon,
    SmartphoneIcon,
    SquareIcon,
} from "lucide-react"

import {NavAnalyses} from "@/components/ui/sidebar/nav-analyses.tsx"
import {NavUser} from "@/components/ui/sidebar/nav-user.tsx"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar.tsx"
import {NavOptions} from "@/components/ui/sidebar/nav-options.tsx";
import {NavOperations} from "@/components/ui/sidebar/nav-operations.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {useQuery} from "@apollo/client";
import {GET_CURRENT_USER_EMAIL_AND_USERNAME} from "@/components/graphql/current-user.graphql.ts";

export const IMPORTER_URL = "/importer";
export const SCAN_JOBS_URL = "/scan-jobs";
export const EMULATOR_URL = "/emulator";
export const FIRMWARES_URL = "/firmwares";
export const APPS_URL = "/apps";
export const FILES_URL = "/files";
export const REPORTS_URL = "/reports";

const data = {
    operations: [
        {
            title: "Importer",
            url: IMPORTER_URL,
            icon: ImportIcon,
        },
        {
            title: "Scan Jobs",
            url: SCAN_JOBS_URL,
            icon: ScanSearchIcon,
        },
        {
            title: "Emulator",
            url: EMULATOR_URL,
            icon: SmartphoneIcon,
        },
    ],
    analyses: [
        {
            name: "Firmwares",
            url: FIRMWARES_URL,
            icon: CpuIcon,
        },
        {
            name: "Apps",
            url: APPS_URL,
            icon: SquareIcon,
        },
        {
            name: "Scan Reports",
            url: REPORTS_URL,
            icon: BookOpenIcon,
        },
    ],
    options: [
        {
            title: "Report Bug",
            url: "https://github.com/FirmwareDroid/FirmwareDroid/issues/new",
            icon: BugIcon,
        },
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {data: userData} = useQuery(GET_CURRENT_USER_EMAIL_AND_USERNAME);
    const email = userData?.me?.email ?? "";
    const username = userData?.me?.username ?? "";

    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            collapsible="icon"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/">
                                <div
                                    className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Avatar>
                                        <AvatarImage src="/Logo1.jpg"/>
                                        <AvatarFallback>FMD</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="grid flex-1 text-left text-lg leading-tight">
                                    <span className="truncate font-medium">FirmwareDroid</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavOperations items={data.operations}/>
                <NavAnalyses analyses={data.analyses}/>
                <NavOptions items={data.options} className="mt-auto"/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={{email: email, name: username, avatar: ""}}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
