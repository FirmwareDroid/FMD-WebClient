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

const data = {
    operations: [
        {
            title: "Importer",
            url: "/importer",
            icon: ImportIcon,
        },
        {
            title: "Scanner",
            url: "/scanner",
            icon: ScanSearchIcon,
        },
        {
            title: "Emulator",
            url: "/emulator",
            icon: SmartphoneIcon,
        },
    ],
    analyses: [
        {
            name: "Firmwares",
            url: "/firmwares",
            icon: CpuIcon,
        },
        {
            name: "Apps",
            url: "/apps",
            icon: SquareIcon,
        },
        {
            name: "Reports",
            url: "/reports",
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
                            <a href="/public">
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
