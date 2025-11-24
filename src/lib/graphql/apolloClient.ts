import {ApolloClient, from, HttpLink, InMemoryCache} from "@apollo/client";
import {RetryLink} from "@apollo/client/link/retry";
import {CSRF_URL, GRAPHQL_URL} from "@/envconfig.ts";

let cachedCsrf: string | null = null;
let inflightCsrf: Promise<string> | null = null;

export function clearCachedCsrf(): void {
    cachedCsrf = null;
    inflightCsrf = null;
}

export async function getCsrf(): Promise<string> {
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
    let tried = false;
    while (true) {
        const csrfToken = await getCsrf();
        const headers = new Headers(options?.headers);
        headers.set("X-CSRFToken", csrfToken);

        const res = await fetch(uri, { ...options, headers, credentials: "include" });

        // if server rejected CSRF, clear cached token and retry once
        if (res.status === 403 && !tried) {
            cachedCsrf = null;
            inflightCsrf = null;
            tried = true;
            continue;
        }

        return res;
    }
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