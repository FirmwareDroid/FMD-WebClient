import {gql} from "@/__generated__";

export const GET_APP_OBJECT_IDS_BY_FIRMWARE_OBJECT_IDS = gql(`
    query GetApkObjectIdsByFirmwareObjectIds {
        android_app_id_list
    }
`);

export const APP_TABLE_ROW_SCANNER = gql(`
    fragment AppTableRowScanner on AndroidAppType {
        id
    }
`);

export const GET_APPS_BY_OBJECT_IDS_SCANNER = gql(`
    query GetAppsByObjectIdsScanner($objectIds: [String!]!) {
        android_app_list(objectIdList: $objectIds) {
            ...AppTableRowScanner
        }
    }
`);

export const CREATE_APK_SCAN_JOB = gql(`
    mutation CreateApkScanJob($objectIds: [String!]!, $scannerName: String!) {
        createApkScanJob(
            moduleName: $scannerName
            objectIdList: $objectIds
            queueName: "high-python"
        ) {
            jobIdList
        }
    }
`);