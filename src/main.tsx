import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './app.tsx'
import {ApolloProvider} from "@apollo/client";
import {client} from "./lib/graphql/apolloClient.ts";
import {BrowserRouter} from "react-router";
import {ThemeProvider} from "@/components/ui/theming/theme-provider.tsx";
import {AuthProvider} from "@/lib/auth.tsx";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ApolloProvider client={client}>
            <AuthProvider>
                <ThemeProvider defaultTheme="dark" storageKey="theme">
                    <BrowserRouter>
                        <App/>
                    </BrowserRouter>
                </ThemeProvider>
            </AuthProvider>
        </ApolloProvider>
    </StrictMode>
)
