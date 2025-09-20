import {gql} from "@/__generated__";


// ----------------------------------------------------------------------------------------------------
// RQ JOBS
// ----------------------------------------------------------------------------------------------------

export const GET_RQ_JOB_LIST = gql(`
    query GetRqJobList {
        rq_job_list {
            funcName
            id
            isFailed
            isFinished
            startedAt
            status
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// FIRMWARE EXTRACTION
// ----------------------------------------------------------------------------------------------------

export const CREATE_FIRMWARE_EXTRACTOR_JOB = gql(`
    mutation CreateFirmwareExtractorJob($storageIndex: Int!) {
        createFirmwareExtractorJob(
            createFuzzyHashes: false
            queueName: "high-python"
            storageIndex: $storageIndex
        ) {
            jobId
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// APK IMPORT
// ----------------------------------------------------------------------------------------------------

export const CREATE_APP_IMPORT_JOB = gql(`
    mutation CreateAppImportJob($storageIndex: Int!) {
        createAppImportJob(
            queueName: "high-python",
            storageIndex: $storageIndex
        ) {
            jobId
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET FIRMWARES (ALL FIELDS)
// ----------------------------------------------------------------------------------------------------

export const GET_FIRMWARE_OBJECT_ID_LIST = gql(`
    query GetFirmwareObjectIdList {
        android_firmware_id_list
    }
`);

export const FIRMWARE_TABLE_ROW = gql(`
    fragment FirmwareTableRow on AndroidFirmwareType {
        id
        absoluteStorePath
        aecsBuildFilePath
        fileSizeBytes
        filename
        hasFileIndex
        hasFuzzyHashIndex
        indexedDate
        md5
        originalFilename
        osVendor
        partitionInfoDict
        relativeStorePath
        sha1
        sha256
        tag
        versionDetected
        pk
    }
`);

export const GET_FIRMWARES_BY_OBJECT_IDS = gql(`
    query GetFirmwaresByObjectIds($objectIds: [String!]!) {
        android_firmware_list(objectIdList: $objectIds) {
            ...FirmwareTableRow
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET FIRMWARES FOR IMPORTER PAGE
// ----------------------------------------------------------------------------------------------------

export const FIRMWARE_TABLE_ROW_IMPORTER = gql(`
    fragment FirmwareTableRowImporter on AndroidFirmwareType {
        id
        indexedDate
        originalFilename
        osVendor
        versionDetected
    }
`);

export const GET_FIRMWARES_BY_OBJECT_IDS_IMPORTER = gql(`
    query GetFirmwaresByObjectIdsImporter($objectIds: [String!]!) {
        android_firmware_list(objectIdList: $objectIds) {
            ...FirmwareTableRowImporter
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET FIRMWARES FOR SCANNER PAGE
// ----------------------------------------------------------------------------------------------------

export const FIRMWARE_TABLE_ROW_SCANNER = gql(`
    fragment FirmwareTableRowScanner on AndroidFirmwareType {
        id
        originalFilename
    }
`);

export const GET_FIRMWARES_BY_OBJECT_IDS_SCANNER = gql(`
    query GetFirmwaresByObjectIdsScanner($objectIds: [String!]!) {
        android_firmware_list(objectIdList: $objectIds) {
            ...FirmwareTableRowScanner
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// DELETE FIRMWARES
// ----------------------------------------------------------------------------------------------------

export const DELETE_FIRMWARE_BY_OBJECT_ID = gql(`
    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {
        deleteAndroidFirmware(firmwareIdList: $objectIds) {
            jobId
        }
    }
`);
