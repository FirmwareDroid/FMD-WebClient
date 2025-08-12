import {gql} from "@apollo/client";

export const HEALTH_QUERY = gql`
    {
        isApiUp
    }
`;

export const CURRENT_USER = gql`
    {
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
`;

export const TOKEN_AUTH = gql`
    query TokenAuth($password: String!, $username: String!) {
        tokenAuth(password: $password, username: $username) {
            token
        }
    }
`;
