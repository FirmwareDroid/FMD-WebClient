import {gql} from "@/__generated__";

export const GET_CURRENT_USER_ID = gql(`
    query GetCurrentUserId {
        me {
            id
        }
    }
`);

export const GET_CURRENT_USER_EMAIL_AND_USERNAME = gql(`
    query GetCurrentUserEmailAndUsername {
        me {
            email
            username
        }
    }
`);
