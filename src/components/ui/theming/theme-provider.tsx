import { createContext, useContext, useEffect } from "react"

type Theme = "dark"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: string
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "dark",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    ...props
}: ThemeProviderProps) {
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light")
        root.classList.add("dark")
        root.style.colorScheme = "dark"
    }, [])

    const value = {
        theme: "dark" as const,
        setTheme: () => null,
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")
    return context
}
