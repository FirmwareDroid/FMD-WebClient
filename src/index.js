import React from 'react';
import { createRoot } from 'react-dom/client';
import './assets/scss/App.scss';
import App from './App';
import { CookiesProvider } from "react-cookie";
import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink, from} from "@apollo/client";
import { GRAPHQL_URL, CSRF_URL } from "./EnvConfig";
import { RetryLink } from "@apollo/client/link/retry";
import { Provider } from 'react-redux'
import store from "./redux/store.js";


const customFetch = async (uri, options) => {
    const tokenResponsee = await fetch(CSRF_URL).then((response) => {
        return response.json()
    }).then(data => { return data.csrfToken })

    options.headers = {
        ...options.headers,
        'X-CSRFToken': tokenResponsee,
    };
    return fetch(uri, options);
};

const httpLink = new HttpLink({
    fetch: customFetch,
    uri: GRAPHQL_URL,
});

const additiveLink = from([
    new RetryLink(),
    httpLink
]);

const gqlClient = new ApolloClient({
    link: additiveLink,
    credentials: 'same-site',
    cache: new InMemoryCache()
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <CookiesProvider>
                <ApolloProvider client={gqlClient}>
                    <App />
                </ApolloProvider>
            </CookiesProvider>
        </Provider>
    </React.StrictMode>,
);
