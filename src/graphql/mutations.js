import {gql} from "@apollo/client";

export const DELETE_TOKEN_COOKIE = gql`
    mutation DeleteTokenCookie {
        deleteTokenCookie {
            deleted
        }
    }
`;


