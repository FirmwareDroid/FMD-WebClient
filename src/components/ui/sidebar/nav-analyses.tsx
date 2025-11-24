import {
    type LucideIcon,
} from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar.tsx"

export function NavAnalyses({analyses,}: Readonly<{
    analyses: {
        name: string
        url: string
        icon: LucideIcon
    }[]
}>) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Analysis</SidebarGroupLabel>
            <SidebarMenu>
                {analyses.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <a href={item.url}>
                                <item.icon/>
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
