import {ApolloClient, from, HttpLink, InMemoryCache} from "@apollo/client";
import {RetryLink} from "@apollo/client/link/retry";
import {CSRF_URL, GRAPHQL_URL} from "@/envconfig.ts";

let cachedCsrf: string | null = null;
let inflightCsrf: Promise<string> | null = null;

async function getCsrf(): Promise<string> {
    if (cachedCsrf) return cachedCsrf;
    if (inflightCsrf) return inflightCsrf;

    inflightCsrf = fetch(CSRF_URL, { credentials: "include" })
        .then(r => r.json())
        .then(({ csrfToken }) => {
            cachedCsrf = csrfToken;
            inflightCsrf = null;
            return csrfToken;
        })
        .catch(e => { inflightCsrf = null; throw e;});
    return inflightCsrf;
}

const customFetch: typeof fetch = async (uri, options) => {
    const csrfToken = await getCsrf();
    const headers = new Headers(options?.headers);
    headers.set("X-CSRFToken", csrfToken);
    return fetch(uri, { ...options, headers, credentials: "include" });
};

const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    fetch: customFetch,
    credentials: "same-origin",
});

export const client = new ApolloClient({
    link: from([new RetryLink(), httpLink]),
    cache: new InMemoryCache(),
});