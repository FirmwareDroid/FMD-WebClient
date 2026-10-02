import {gql} from "@/__generated__";

export const GET_RQ_JOB_LIST = gql(`
    query GetRqJobList($queueName: String, $jobIds: [String]) {
        rq_job_list(queueName: $queueName, jobIds: $jobIds) {
            description
            funcName
            id
            isFailed
            isFinished
            queueName
            startedAt
            status
            meta
        }
    }
`);

export const GET_RQ_QUEUE_NAMES = gql(`
    query GetRqJobQueueNames {
        rq_queue_name_list
    }
`);
