/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query GetApiHealth {\n        isApiUp\n    }\n": typeof types.GetApiHealthDocument,
    "\n    query GetApkObjectIdsByFirmwareObjectIds {\n        android_app_id_list\n    }\n": typeof types.GetApkObjectIdsByFirmwareObjectIdsDocument,
    "\n    fragment AppTableRowScanner on AndroidAppType {\n        id\n    }\n": typeof types.AppTableRowScannerFragmentDoc,
    "\n    query GetAppsByObjectIdsScanner($objectIds: [String!]!) {\n        android_app_list(objectIdList: $objectIds) {\n            ...AppTableRowScanner\n        }\n    }\n": typeof types.GetAppsByObjectIdsScannerDocument,
    "\n    mutation CreateApkScanJob($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            moduleName: $scannerName\n            objectIdList: $objectIds\n            queueName: \"high-python\"\n        ) {\n            jobIdList\n        }\n    }\n": typeof types.CreateApkScanJobDocument,
    "\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            token\n        }\n    }\n": typeof types.GetAuthTokenDocument,
    "\n    mutation DeleteTokenCookie {\n        deleteTokenCookie {\n            deleted\n        }\n    }\n": typeof types.DeleteTokenCookieDocument,
    "\n    query GetCurrentUserId {\n        me {\n            id\n        }\n    }\n": typeof types.GetCurrentUserIdDocument,
    "\n    query GetCurrentUserEmailAndUsername {\n        me {\n            email\n            username\n        }\n    }\n": typeof types.GetCurrentUserEmailAndUsernameDocument,
    "\n    mutation CreateFirmwareExtractorJob($storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: \"high-python\"\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": typeof types.CreateFirmwareExtractorJobDocument,
    "\n    mutation CreateAppImportJob($storageIndex: Int!) {\n        createAppImportJob(\n            queueName: \"high-python\",\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": typeof types.CreateAppImportJobDocument,
    "\n    query GetFirmwareObjectIdList {\n        android_firmware_id_list\n    }\n": typeof types.GetFirmwareObjectIdListDocument,
    "\n    fragment FirmwareTableRow on AndroidFirmwareType {\n        id\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n        pk\n    }\n": typeof types.FirmwareTableRowFragmentDoc,
    "\n    query GetFirmwaresByObjectIds($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRow\n        }\n    }\n": typeof types.GetFirmwaresByObjectIdsDocument,
    "\n    fragment FirmwareTableRowImporter on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n": typeof types.FirmwareTableRowImporterFragmentDoc,
    "\n    query GetFirmwaresByObjectIdsImporter($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRowImporter\n        }\n    }\n": typeof types.GetFirmwaresByObjectIdsImporterDocument,
    "\n    fragment FirmwareTableRowScanner on AndroidFirmwareType {\n        id\n        originalFilename\n    }\n": typeof types.FirmwareTableRowScannerFragmentDoc,
    "\n    query GetFirmwaresByObjectIdsScanner($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRowScanner\n        }\n    }\n": typeof types.GetFirmwaresByObjectIdsScannerDocument,
    "\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n": typeof types.DeleteFirmwareByObjectIdDocument,
    "\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            startedAt\n            status\n        }\n    }\n": typeof types.GetRqJobListDocument,
};
const documents: Documents = {
    "\n    query GetApiHealth {\n        isApiUp\n    }\n": types.GetApiHealthDocument,
    "\n    query GetApkObjectIdsByFirmwareObjectIds {\n        android_app_id_list\n    }\n": types.GetApkObjectIdsByFirmwareObjectIdsDocument,
    "\n    fragment AppTableRowScanner on AndroidAppType {\n        id\n    }\n": types.AppTableRowScannerFragmentDoc,
    "\n    query GetAppsByObjectIdsScanner($objectIds: [String!]!) {\n        android_app_list(objectIdList: $objectIds) {\n            ...AppTableRowScanner\n        }\n    }\n": types.GetAppsByObjectIdsScannerDocument,
    "\n    mutation CreateApkScanJob($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            moduleName: $scannerName\n            objectIdList: $objectIds\n            queueName: \"high-python\"\n        ) {\n            jobIdList\n        }\n    }\n": types.CreateApkScanJobDocument,
    "\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            token\n        }\n    }\n": types.GetAuthTokenDocument,
    "\n    mutation DeleteTokenCookie {\n        deleteTokenCookie {\n            deleted\n        }\n    }\n": types.DeleteTokenCookieDocument,
    "\n    query GetCurrentUserId {\n        me {\n            id\n        }\n    }\n": types.GetCurrentUserIdDocument,
    "\n    query GetCurrentUserEmailAndUsername {\n        me {\n            email\n            username\n        }\n    }\n": types.GetCurrentUserEmailAndUsernameDocument,
    "\n    mutation CreateFirmwareExtractorJob($storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: \"high-python\"\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": types.CreateFirmwareExtractorJobDocument,
    "\n    mutation CreateAppImportJob($storageIndex: Int!) {\n        createAppImportJob(\n            queueName: \"high-python\",\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": types.CreateAppImportJobDocument,
    "\n    query GetFirmwareObjectIdList {\n        android_firmware_id_list\n    }\n": types.GetFirmwareObjectIdListDocument,
    "\n    fragment FirmwareTableRow on AndroidFirmwareType {\n        id\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n        pk\n    }\n": types.FirmwareTableRowFragmentDoc,
    "\n    query GetFirmwaresByObjectIds($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRow\n        }\n    }\n": types.GetFirmwaresByObjectIdsDocument,
    "\n    fragment FirmwareTableRowImporter on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n": types.FirmwareTableRowImporterFragmentDoc,
    "\n    query GetFirmwaresByObjectIdsImporter($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRowImporter\n        }\n    }\n": types.GetFirmwaresByObjectIdsImporterDocument,
    "\n    fragment FirmwareTableRowScanner on AndroidFirmwareType {\n        id\n        originalFilename\n    }\n": types.FirmwareTableRowScannerFragmentDoc,
    "\n    query GetFirmwaresByObjectIdsScanner($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRowScanner\n        }\n    }\n": types.GetFirmwaresByObjectIdsScannerDocument,
    "\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n": types.DeleteFirmwareByObjectIdDocument,
    "\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            startedAt\n            status\n        }\n    }\n": types.GetRqJobListDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetApiHealth {\n        isApiUp\n    }\n"): (typeof documents)["\n    query GetApiHealth {\n        isApiUp\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetApkObjectIdsByFirmwareObjectIds {\n        android_app_id_list\n    }\n"): (typeof documents)["\n    query GetApkObjectIdsByFirmwareObjectIds {\n        android_app_id_list\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment AppTableRowScanner on AndroidAppType {\n        id\n    }\n"): (typeof documents)["\n    fragment AppTableRowScanner on AndroidAppType {\n        id\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetAppsByObjectIdsScanner($objectIds: [String!]!) {\n        android_app_list(objectIdList: $objectIds) {\n            ...AppTableRowScanner\n        }\n    }\n"): (typeof documents)["\n    query GetAppsByObjectIdsScanner($objectIds: [String!]!) {\n        android_app_list(objectIdList: $objectIds) {\n            ...AppTableRowScanner\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateApkScanJob($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            moduleName: $scannerName\n            objectIdList: $objectIds\n            queueName: \"high-python\"\n        ) {\n            jobIdList\n        }\n    }\n"): (typeof documents)["\n    mutation CreateApkScanJob($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            moduleName: $scannerName\n            objectIdList: $objectIds\n            queueName: \"high-python\"\n        ) {\n            jobIdList\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            token\n        }\n    }\n"): (typeof documents)["\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            token\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteTokenCookie {\n        deleteTokenCookie {\n            deleted\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteTokenCookie {\n        deleteTokenCookie {\n            deleted\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetCurrentUserId {\n        me {\n            id\n        }\n    }\n"): (typeof documents)["\n    query GetCurrentUserId {\n        me {\n            id\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetCurrentUserEmailAndUsername {\n        me {\n            email\n            username\n        }\n    }\n"): (typeof documents)["\n    query GetCurrentUserEmailAndUsername {\n        me {\n            email\n            username\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateFirmwareExtractorJob($storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: \"high-python\"\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"): (typeof documents)["\n    mutation CreateFirmwareExtractorJob($storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: \"high-python\"\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateAppImportJob($storageIndex: Int!) {\n        createAppImportJob(\n            queueName: \"high-python\",\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"): (typeof documents)["\n    mutation CreateAppImportJob($storageIndex: Int!) {\n        createAppImportJob(\n            queueName: \"high-python\",\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFirmwareObjectIdList {\n        android_firmware_id_list\n    }\n"): (typeof documents)["\n    query GetFirmwareObjectIdList {\n        android_firmware_id_list\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment FirmwareTableRow on AndroidFirmwareType {\n        id\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n        pk\n    }\n"): (typeof documents)["\n    fragment FirmwareTableRow on AndroidFirmwareType {\n        id\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n        pk\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFirmwaresByObjectIds($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRow\n        }\n    }\n"): (typeof documents)["\n    query GetFirmwaresByObjectIds($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRow\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment FirmwareTableRowImporter on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n"): (typeof documents)["\n    fragment FirmwareTableRowImporter on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFirmwaresByObjectIdsImporter($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRowImporter\n        }\n    }\n"): (typeof documents)["\n    query GetFirmwaresByObjectIdsImporter($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRowImporter\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment FirmwareTableRowScanner on AndroidFirmwareType {\n        id\n        originalFilename\n    }\n"): (typeof documents)["\n    fragment FirmwareTableRowScanner on AndroidFirmwareType {\n        id\n        originalFilename\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFirmwaresByObjectIdsScanner($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRowScanner\n        }\n    }\n"): (typeof documents)["\n    query GetFirmwaresByObjectIdsScanner($objectIds: [String!]!) {\n        android_firmware_list(objectIdList: $objectIds) {\n            ...FirmwareTableRowScanner\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            startedAt\n            status\n        }\n    }\n"): (typeof documents)["\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            startedAt\n            status\n        }\n    }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;