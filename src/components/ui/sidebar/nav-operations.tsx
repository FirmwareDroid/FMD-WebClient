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

export function NavOperations({items,}: Readonly<{
    items: {
        title: string
        url: string
        icon: LucideIcon
    }[]
}>) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                            <NavLink to={item.url} className={({isActive}) => isActive ? "bg-sidebar-accent" : undefined}>
                                <item.icon/>
                                <span>{item.title}</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
