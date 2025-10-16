import ReactDOM from "react-dom/client";
import {useEffect, useRef} from "react";
import {StyleSheetManager, ThemeProvider} from "styled-components";
import {GlobalStyles} from "@/assets/emulator/theming/global";
import EmulatorPage from "@/pages/EmulatorPage";
import {useTheme} from "@/components/ui/theming/theme-provider.tsx";
import {darkTheme, lightTheme} from "@/assets/emulator/theming/theme";

export function EmulatorPageWrapper() {
    const containerRef = useRef<HTMLDivElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);
    const rootRef = useRef<ReturnType<typeof ReactDOM.createRoot> | null>(null);

    // Use theme but resolve "system" to "light" or "dark"
    const {theme} = useTheme();
    const preferredColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
    const resolvedMode =
        theme === "light" || theme === "dark"
            ? theme
            : preferredColorScheme;
    const themeMode = resolvedMode === "light" ? lightTheme : darkTheme;

    useEffect(() => {
        if (!shadowRootRef.current && containerRef.current) {
            const shadow = containerRef.current.attachShadow({mode: "open"});
            shadowRootRef.current = shadow;

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css";
            shadow.appendChild(link);

            const mountPoint = document.createElement("div");
            mountPoint.id = "emulator-root";
            shadow.appendChild(mountPoint);

            rootRef.current = ReactDOM.createRoot(mountPoint);
        }

        if (rootRef.current && shadowRootRef.current) {
            rootRef.current.render(
                <StyleSheetManager target={shadowRootRef.current as unknown as HTMLElement}>
                    <ThemeProvider theme={themeMode}>
                        <GlobalStyles/>
                        <EmulatorPage/>
                    </ThemeProvider>
                </StyleSheetManager>
            );
        }
    }, [themeMode]);

    return <div ref={containerRef}/>;
}