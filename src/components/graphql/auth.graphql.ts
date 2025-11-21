import {gql} from "@/__generated__";

export const GET_AUTH_TOKEN = gql(`
    query GetAuthToken($password: String!, $username: String!) {
        tokenAuth(password: $password, username: $username) {
            payload
        }
    }
`);

export const DELETE_TOKEN_COOKIE = gql(`
    mutation DeleteTokenCookie {
        deleteTokenCookie {
            deleted
        }
    }
`);
