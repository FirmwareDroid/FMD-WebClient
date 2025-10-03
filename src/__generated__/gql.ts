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
    "\n    mutation CreateAppImportJob($storageIndex: Int!) {\n        createAppImportJob(\n            queueName: \"high-python\",\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": typeof types.CreateAppImportJobDocument,
    "\n    fragment AppAll on AndroidAppType {\n        absoluteStorePath\n        androidManifestDict\n        fileSizeBytes\n        filename\n        id\n        indexedDate\n        md5\n        originalFilename\n        packagename\n        partitionName\n        pk\n        relativeFirmwarePath\n        relativeStorePath\n        sha1\n        sha256\n    }\n": typeof types.AppAllFragmentDoc,
    "\n    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    androidAppIdList {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": typeof types.GetAppsByFirmwareObjectIdsDocument,
    "\n    query GetAppsById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    androidAppIdList(id: $id) {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": typeof types.GetAppsByIdDocument,
    "\n    query GetScannerModuleNames {\n        scanner_module_name_list\n    }\n": typeof types.GetScannerModuleNamesDocument,
    "\n    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            objectIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: \"default-python\",\n        ) {\n            jobIdList\n        }\n    }\n": typeof types.ScanApksByObjectIdsDocument,
    "\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            token\n        }\n    }\n": typeof types.GetAuthTokenDocument,
    "\n    mutation DeleteTokenCookie {\n        deleteTokenCookie {\n            deleted\n        }\n    }\n": typeof types.DeleteTokenCookieDocument,
    "\n    query GetCurrentUserId {\n        me {\n            id\n        }\n    }\n": typeof types.GetCurrentUserIdDocument,
    "\n    query GetCurrentUserEmailAndUsername {\n        me {\n            email\n            username\n        }\n    }\n": typeof types.GetCurrentUserEmailAndUsernameDocument,
    "\n    mutation CreateFirmwareExtractorJob($storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: \"high-python\"\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": typeof types.CreateFirmwareExtractorJobDocument,
    "\n    fragment FirmwareAll on AndroidFirmwareType {\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        id\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        pk\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n    }\n": typeof types.FirmwareAllFragmentDoc,
    "\n    query GetFirmwaresByObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    ...FirmwareAll\n                }\n            }\n        }\n    }\n": typeof types.GetFirmwaresByObjectIdsDocument,
    "\n    fragment FirmwareRowImporterPage on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n": typeof types.FirmwareRowImporterPageFragmentDoc,
    "\n    query GetFirmwaresImporterPage {\n        android_firmware_connection {\n            edges {\n                node {\n                    ...FirmwareRowImporterPage\n                }\n            }\n        }\n    }\n": typeof types.GetFirmwaresImporterPageDocument,
    "\n    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            firmwareIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: \"default-python\",\n        ) {\n            jobIdList\n        }\n    }\n": typeof types.ScanApksByFirmwareObjectIdsDocument,
    "\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n": typeof types.DeleteFirmwareByObjectIdDocument,
    "\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            startedAt\n            status\n        }\n    }\n": typeof types.GetRqJobListDocument,
};
const documents: Documents = {
    "\n    query GetApiHealth {\n        isApiUp\n    }\n": types.GetApiHealthDocument,
    "\n    mutation CreateAppImportJob($storageIndex: Int!) {\n        createAppImportJob(\n            queueName: \"high-python\",\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": types.CreateAppImportJobDocument,
    "\n    fragment AppAll on AndroidAppType {\n        absoluteStorePath\n        androidManifestDict\n        fileSizeBytes\n        filename\n        id\n        indexedDate\n        md5\n        originalFilename\n        packagename\n        partitionName\n        pk\n        relativeFirmwarePath\n        relativeStorePath\n        sha1\n        sha256\n    }\n": types.AppAllFragmentDoc,
    "\n    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    androidAppIdList {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": types.GetAppsByFirmwareObjectIdsDocument,
    "\n    query GetAppsById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    androidAppIdList(id: $id) {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": types.GetAppsByIdDocument,
    "\n    query GetScannerModuleNames {\n        scanner_module_name_list\n    }\n": types.GetScannerModuleNamesDocument,
    "\n    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            objectIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: \"default-python\",\n        ) {\n            jobIdList\n        }\n    }\n": types.ScanApksByObjectIdsDocument,
    "\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            token\n        }\n    }\n": types.GetAuthTokenDocument,
    "\n    mutation DeleteTokenCookie {\n        deleteTokenCookie {\n            deleted\n        }\n    }\n": types.DeleteTokenCookieDocument,
    "\n    query GetCurrentUserId {\n        me {\n            id\n        }\n    }\n": types.GetCurrentUserIdDocument,
    "\n    query GetCurrentUserEmailAndUsername {\n        me {\n            email\n            username\n        }\n    }\n": types.GetCurrentUserEmailAndUsernameDocument,
    "\n    mutation CreateFirmwareExtractorJob($storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: \"high-python\"\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": types.CreateFirmwareExtractorJobDocument,
    "\n    fragment FirmwareAll on AndroidFirmwareType {\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        id\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        pk\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n    }\n": types.FirmwareAllFragmentDoc,
    "\n    query GetFirmwaresByObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    ...FirmwareAll\n                }\n            }\n        }\n    }\n": types.GetFirmwaresByObjectIdsDocument,
    "\n    fragment FirmwareRowImporterPage on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n": types.FirmwareRowImporterPageFragmentDoc,
    "\n    query GetFirmwaresImporterPage {\n        android_firmware_connection {\n            edges {\n                node {\n                    ...FirmwareRowImporterPage\n                }\n            }\n        }\n    }\n": types.GetFirmwaresImporterPageDocument,
    "\n    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            firmwareIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: \"default-python\",\n        ) {\n            jobIdList\n        }\n    }\n": types.ScanApksByFirmwareObjectIdsDocument,
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
export function gql(source: "\n    mutation CreateAppImportJob($storageIndex: Int!) {\n        createAppImportJob(\n            queueName: \"high-python\",\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"): (typeof documents)["\n    mutation CreateAppImportJob($storageIndex: Int!) {\n        createAppImportJob(\n            queueName: \"high-python\",\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment AppAll on AndroidAppType {\n        absoluteStorePath\n        androidManifestDict\n        fileSizeBytes\n        filename\n        id\n        indexedDate\n        md5\n        originalFilename\n        packagename\n        partitionName\n        pk\n        relativeFirmwarePath\n        relativeStorePath\n        sha1\n        sha256\n    }\n"): (typeof documents)["\n    fragment AppAll on AndroidAppType {\n        absoluteStorePath\n        androidManifestDict\n        fileSizeBytes\n        filename\n        id\n        indexedDate\n        md5\n        originalFilename\n        packagename\n        partitionName\n        pk\n        relativeFirmwarePath\n        relativeStorePath\n        sha1\n        sha256\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    androidAppIdList {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    androidAppIdList {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetAppsById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    androidAppIdList(id: $id) {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetAppsById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    androidAppIdList(id: $id) {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetScannerModuleNames {\n        scanner_module_name_list\n    }\n"): (typeof documents)["\n    query GetScannerModuleNames {\n        scanner_module_name_list\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            objectIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: \"default-python\",\n        ) {\n            jobIdList\n        }\n    }\n"): (typeof documents)["\n    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            objectIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: \"default-python\",\n        ) {\n            jobIdList\n        }\n    }\n"];
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
export function gql(source: "\n    fragment FirmwareAll on AndroidFirmwareType {\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        id\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        pk\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n    }\n"): (typeof documents)["\n    fragment FirmwareAll on AndroidFirmwareType {\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        id\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        pk\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFirmwaresByObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    ...FirmwareAll\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetFirmwaresByObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    ...FirmwareAll\n                }\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment FirmwareRowImporterPage on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n"): (typeof documents)["\n    fragment FirmwareRowImporterPage on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFirmwaresImporterPage {\n        android_firmware_connection {\n            edges {\n                node {\n                    ...FirmwareRowImporterPage\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetFirmwaresImporterPage {\n        android_firmware_connection {\n            edges {\n                node {\n                    ...FirmwareRowImporterPage\n                }\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            firmwareIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: \"default-python\",\n        ) {\n            jobIdList\n        }\n    }\n"): (typeof documents)["\n    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!) {\n        createApkScanJob(\n            firmwareIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: \"default-python\",\n        ) {\n            jobIdList\n        }\n    }\n"];
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