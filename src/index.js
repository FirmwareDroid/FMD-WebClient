import React from 'react';
import ReactDOM from 'react-dom';
import './assets/scss/App.scss';
import App from './App';
import {CookiesProvider} from "react-cookie";
import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink, ApolloLink, from} from "@apollo/client";
import { GRAPHQL_URL } from "./EnvConfig";
import { CSRF_URL } from "./EnvConfig";
import {RetryLink} from "@apollo/client/link/retry";
import {useFetch} from "./hooks/fetch/useFetch";
import {setContext} from "@apollo/client/link/context";

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

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
        <ApolloProvider client={gqlClient}>
                <App />
        </ApolloProvider>
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
