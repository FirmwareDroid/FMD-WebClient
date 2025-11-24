import {gql} from "@/__generated__";

export const GET_RQ_JOB_LIST = gql(`
    query GetRqJobList {
        rq_job_list {
            description
            funcName
            id
            isFailed
            isFinished
            queueName
            startedAt
            status
        }
    }
`);

export const GET_RQ_QUEUE_NAMES = gql(`
    query GetRqJobQueueNames {
        rq_queue_name_list
    }
`);
