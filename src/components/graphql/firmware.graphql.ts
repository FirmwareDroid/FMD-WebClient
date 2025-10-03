import {gql} from "@/__generated__";

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
    query GetFirmwaresByObjectIds($objectIds: [String!]) {
        android_firmware_connection(objectIdList: $objectIds) {
            edges {
                node {
                    ...FirmwareAll
                }
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
    query GetFirmwaresImporterPage {
        android_firmware_connection {
            edges {
                node {
                    ...FirmwareRowImporterPage
                }
            }
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// SCAN ALL APKs OF FIRMWARES
// ----------------------------------------------------------------------------------------------------

export const SCAN_APKS_BY_FIRMWARE_OBJECT_IDS = gql(`
    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!) {
        createApkScanJob(
            firmwareIdList: $objectIds,
            moduleName: $scannerName,
            queueName: "default-python",
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
