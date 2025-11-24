import {gql} from "@/__generated__";

// ----------------------------------------------------------------------------------------------------
// APP IMPORT
// ----------------------------------------------------------------------------------------------------

export const CREATE_APP_IMPORT_JOB = gql(`
    mutation CreateAppImportJob($queueName: String!, $storageIndex: Int!) {
        createAppImportJob(
            queueName: $queueName,
            storageIndex: $storageIndex
        ) {
            jobId
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET APPS (ALL FIELDS)
// ----------------------------------------------------------------------------------------------------

export const APP_ALL = gql(`
    fragment AppAll on AndroidAppType {
        absoluteStorePath
        androidManifestDict
        fileSizeBytes
        filename
        id
        indexedDate
        md5
        originalFilename
        packagename
        partitionName
        pk
        relativeFirmwarePath
        relativeStorePath
        sha1
        sha256
        firmwareIdReference {
            id
        }
        firmwareFileReference {
            id
        }
    }
`);

export const GET_APPS_BY_FIRMWARE_OBJECT_IDS = gql(`
    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {
        android_firmware_connection(objectIdList: $objectIds) {
            edges {
                node {
                    androidAppIdList {
                        edges {
                            node {
                                ...AppAll
                            }
                        }
                    }
                }
            }
        }
    }
`);

export const GET_APP_BY_ID = gql(`
    query GetAppById($id: ID!) {
        android_firmware_connection {
            edges {
                node {
                    androidAppIdList(id: $id) {
                        edges {
                            node {
                                ...AppAll
                            }
                        }
                    }
                }
            }
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// APK SCAN
// ----------------------------------------------------------------------------------------------------

export const GET_SCANNER_MODULE_NAMES = gql(`
    query GetScannerModuleNames {
        scanner_module_name_list
    }
`);

export const SCAN_APKS_BY_OBJECT_IDS = gql(`
    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {
        createApkScanJob(
            objectIdList: $objectIds,
            moduleName: $scannerName,
            queueName: $queueName,
        ) {
            jobIdList
        }
    }
`);