import {ModeToggle} from "@/components/ui/theming/mode-toggle.tsx";
import {Button} from "../button.tsx";
import {Link, NavLink} from "react-router";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList, navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu.tsx";

function navMenuLinkClass(isActive: boolean) {
    return [
        navigationMenuTriggerStyle(),
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
    ].join(" ");
}

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
            <div className="container mx-auto px-4">
                <nav className="grid h-14 grid-cols-3 items-center">
                    <div className="flex items-center justify-start">
                        <Link to="/" className="flex items-center gap-2">
                            <span
                                className="inline-block h-6 w-6 rounded bg-primary"
                                aria-hidden
                            />
                            <span className="text-base font-semibold tracking-tight">Logo</span>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center">
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavLink to="/about">
                                        {({ isActive }) => (
                                            <NavigationMenuLink className={navMenuLinkClass(isActive)}>
                                                About
                                            </NavigationMenuLink>
                                        )}
                                    </NavLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavLink to="/emulator">
                                        {({ isActive }) => (
                                            <NavigationMenuLink className={navMenuLinkClass(isActive)}>
                                                Emulator
                                            </NavigationMenuLink>
                                        )}
                                    </NavLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="sm" className="px-3">
                            <Link to="/login">Sign In</Link>
                        </Button>
                        <ModeToggle />
                    </div>
                </nav>
            </div>
        </header>
    );
}
