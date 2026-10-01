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
import {NavLink} from "react-router";

export function NavAnalyses({analyses,}: Readonly<{
    analyses: {
        name: string
        url: string
        icon: LucideIcon
    }[]
}>) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">Analysis</SidebarGroupLabel>
            <SidebarMenu>
                {analyses.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <NavLink to={item.url} className={({isActive}) => isActive ? "bg-sidebar-accent font-semibold text-[#8bd450]" : undefined}>
                                <item.icon/>
                                <span>{item.name}</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
