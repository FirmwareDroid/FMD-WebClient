import {gql} from "@/__generated__";

// ----------------------------------------------------------------------------------------------------
// FIRMWARE EXTRACTION
// ----------------------------------------------------------------------------------------------------

export const CREATE_FIRMWARE_EXTRACTOR_JOB = gql(`
    mutation CreateFirmwareExtractorJob($queueName: String!, $storageIndex: Int!) {
        createFirmwareExtractorJob(
            createFuzzyHashes: false
            queueName: $queueName
            storageIndex: $storageIndex
        ) {
            jobId
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET FIRMWARES (ALL FIELDS)
// ----------------------------------------------------------------------------------------------------

export const FIRMWARE_ALL = gql(`
    fragment FirmwareAll on AndroidFirmwareType {
        absoluteStorePath
        aecsBuildFilePath
        fileSizeBytes
        filename
        hasFileIndex
        hasFuzzyHashIndex
        id
        indexedDate
        md5
        originalFilename
        osVendor
        partitionInfoDict
        pk
        relativeStorePath
        sha1
        sha256
        tag
        versionDetected
    }
`);

export const GET_FIRMWARES_BY_OBJECT_IDS = gql(`
    query GetFirmwaresByObjectIds(
        $objectIds: [String!]
        $first: Int
        $after: String
    ) {
        android_firmware_connection(
            objectIdList: $objectIds
            first: $first
            after: $after
        ) {
            edges {
                cursor
                node {
                    ...FirmwareAll
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET FIRMWARES FOR IMPORTER PAGE
// ----------------------------------------------------------------------------------------------------

export const FIRMWARE_ROW_IMPORTER_PAGE = gql(`
    fragment FirmwareRowImporterPage on AndroidFirmwareType {
        id
        indexedDate
        originalFilename
        osVendor
        versionDetected
    }
`);

export const GET_FIRMWARES_IMPORTER_PAGE = gql(`
    query GetFirmwaresImporterPage($first: Int, $after: String) {
        android_firmware_connection(first: $first, after: $after) {
            edges {
                cursor
                node {
                    ...FirmwareRowImporterPage
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// SCAN ALL APKs OF FIRMWARES
// ----------------------------------------------------------------------------------------------------

export const SCAN_APKS_BY_FIRMWARE_OBJECT_IDS = gql(`
    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {
        createApkScanJob(
            firmwareIdList: $objectIds,
            moduleName: $scannerName,
            queueName: $queueName,
        ) {
            jobIdList
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
