import {gql} from "@/__generated__";

export const GET_RQ_JOB_LIST = gql(`
    query GetRqJobList {
        rq_job_list {
            description
            funcName
            id
            isFailed
            isFinished
            startedAt
            status
        }
    }
`);
