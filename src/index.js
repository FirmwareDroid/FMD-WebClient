import React from 'react';
import ReactDOM from 'react-dom';
import './assets/scss/App.scss';
import App from './App';
import { CookiesProvider } from "react-cookie";
import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink, from} from "@apollo/client";
import { GRAPHQL_URL } from "./EnvConfig";
import { CSRF_URL } from "./EnvConfig";
import { RetryLink } from "@apollo/client/link/retry";
import { Provider } from 'react-redux'
import store from "./redux/store.js";
import { TerminalContextProvider } from "react-terminal";


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
      <Provider store={store}>
        <CookiesProvider>
            <ApolloProvider client={gqlClient}>
                    <App />
            </ApolloProvider>
        </CookiesProvider>
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
