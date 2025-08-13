import {gql} from "../__generated__";

export const GET_API_HEALTH = gql(`
    query GetApiHealth {
        isApiUp
    }
`);
