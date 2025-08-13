import {gql} from "../__generated__";

export const GET_CURRENT_USER = gql(`
    query GetCurrentUser {
        me {
            email
            firstName
            isActive
            isStaff
            isSuperuser
            lastLogin
            lastName
            username
            dateJoined
            id
        }
    }
`);
