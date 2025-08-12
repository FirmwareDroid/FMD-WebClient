import React from 'react';
import { createRoot } from 'react-dom/client';
import './assets/scss/App.scss';
import App from './App';
import { CookiesProvider } from "react-cookie";
import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink, from} from "@apollo/client";
import { GRAPHQL_URL, CSRF_URL } from "./EnvConfig";
import { RetryLink } from "@apollo/client/link/retry";

type CsrfResponse = { csrfToken: string };

const customFetch: typeof fetch = async (uri, options) => {
    const res = await fetch(CSRF_URL);
    const { csrfToken } = (await res.json()) as CsrfResponse;

    const headers = new Headers(options?.headers);
    headers.set('X-CSRFToken', csrfToken);

    return fetch(uri, { ...options, headers });
};

const httpLink = new HttpLink({
    fetch: customFetch,
    uri: GRAPHQL_URL,
});

const additiveLink = from([new RetryLink(), httpLink]);

const gqlClient = new ApolloClient({
    link: additiveLink,
    cache: new InMemoryCache()
});

const container = document.getElementById('root');
if (!container) throw new Error('Root container element not found');

const root = createRoot(container);
root.render(
    <React.StrictMode>
        <CookiesProvider>
            <ApolloProvider client={gqlClient}>
                <App />
            </ApolloProvider>
        </CookiesProvider>
    </React.StrictMode>,
);
