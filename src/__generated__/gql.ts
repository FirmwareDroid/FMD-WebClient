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
    "\n    query GetApkScannerLogs{\n        apk_scanner_log_list {\n            id\n            level\n            message\n            module\n            tags\n            timestamp\n            threadName\n            thread\n            method\n            loggerName\n            lineNumber\n            fileName\n            details\n        }\n    }\n": typeof types.GetApkScannerLogsDocument,
    "\n    mutation CreateAppImportJob($queueName: String!, $storageIndex: Int!) {\n        createAppImportJob(\n            queueName: $queueName,\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": typeof types.CreateAppImportJobDocument,
    "\n    fragment AppAll on AndroidAppType {\n        absoluteStorePath\n        androidManifestDict\n        fileSizeBytes\n        filename\n        id\n        indexedDate\n        md5\n        originalFilename\n        packagename\n        partitionName\n        pk\n        relativeFirmwarePath\n        relativeStorePath\n        sha1\n        sha256\n        firmwareIdReference {\n            id\n        }\n        firmwareFileReference {\n            id\n        }\n    }\n": typeof types.AppAllFragmentDoc,
    "\n    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    androidAppIdList {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": typeof types.GetAppsByFirmwareObjectIdsDocument,
    "\n    query GetAppById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    androidAppIdList(id: $id) {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": typeof types.GetAppByIdDocument,
    "\n    query GetScannerModuleNames {\n        scanner_module_name_list\n    }\n": typeof types.GetScannerModuleNamesDocument,
    "\n    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {\n        createApkScanJob(\n            objectIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: $queueName,\n        ) {\n            jobIdList\n        }\n    }\n": typeof types.ScanApksByObjectIdsDocument,
    "\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            payload\n        }\n    }\n": typeof types.GetAuthTokenDocument,
    "\n    mutation DeleteTokenCookie {\n        deleteTokenCookie {\n            deleted\n        }\n    }\n": typeof types.DeleteTokenCookieDocument,
    "\n    query GetCurrentUserId {\n        me {\n            id\n        }\n    }\n": typeof types.GetCurrentUserIdDocument,
    "\n    query GetCurrentUserEmailAndUsername {\n        me {\n            email\n            username\n        }\n    }\n": typeof types.GetCurrentUserEmailAndUsernameDocument,
    "\n    fragment FileAll on FirmwareFileType {\n        id\n        name\n        absoluteStorePath\n        fileSizeBytes\n        indexedDate\n        isDirectory\n        isOnDisk\n        isSymlink\n        md5\n        metaDict\n        parentDir\n        partitionName\n        relativePath\n        firmwareIdReference {\n            id\n        }\n        androidAppReference {\n            id\n        }\n    }\n": typeof types.FileAllFragmentDoc,
    "\n    query GetFilesByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    firmwareFileIdList {\n                        edges {\n                            node {\n                                ...FileAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": typeof types.GetFilesByFirmwareObjectIdsDocument,
    "\n    query GetFileById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    firmwareFileIdList(id: $id) {\n                        edges {\n                            node {\n                                ...FileAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": typeof types.GetFileByIdDocument,
    "\n    mutation CreateFirmwareExtractorJob($queueName: String!, $storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: $queueName\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": typeof types.CreateFirmwareExtractorJobDocument,
    "\n    fragment FirmwareAll on AndroidFirmwareType {\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        id\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        pk\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n    }\n": typeof types.FirmwareAllFragmentDoc,
    "\n    query GetFirmwaresByObjectIds(\n        $objectIds: [String!]\n        $first: Int\n        $after: String\n    ) {\n        android_firmware_connection(\n            objectIdList: $objectIds\n            first: $first\n            after: $after\n        ) {\n            edges {\n                cursor\n                node {\n                    ...FirmwareAll\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n": typeof types.GetFirmwaresByObjectIdsDocument,
    "\n    fragment FirmwareRowImporterPage on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n": typeof types.FirmwareRowImporterPageFragmentDoc,
    "\n    query GetFirmwaresImporterPage($first: Int, $after: String) {\n        android_firmware_connection(first: $first, after: $after) {\n            edges {\n                cursor\n                node {\n                    ...FirmwareRowImporterPage\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n": typeof types.GetFirmwaresImporterPageDocument,
    "\n    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {\n        createApkScanJob(\n            firmwareIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: $queueName,\n        ) {\n            jobIdList\n        }\n    }\n": typeof types.ScanApksByFirmwareObjectIdsDocument,
    "\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n": typeof types.DeleteFirmwareByObjectIdDocument,
    "\n    fragment MetaReportFields on ApkScannerReportInterface {\n        reportDate\n        scannerName\n        scannerVersion\n        scanStatus\n        androidAppIdReference {\n            id\n            filename\n            firmwareIdReference {\n                id\n            }\n        }\n    }\n": typeof types.MetaReportFieldsFragmentDoc,
    "\n    fragment ApkScannerReport on ApkScannerReportInterface {\n        ...AndroGuardReportType\n        ...ApkidReportType\n        ...ApkleaksReportType\n        ...ExodusReportType\n        ...TrueseeingReportType\n        ...AndrowarnReportType\n        ...QuarkEngineReportType\n        ...QarkReportType\n        ...SuperReportType\n        ...VirusTotalReportType\n        ...MobSFSReportType\n        ...APKscanReportType\n        ...FlowDroidReportType\n    }\n": typeof types.ApkScannerReportFragmentDoc,
    "\n    query GetReport($reportObjectId: String, $appObjectId: String, $scannerName: String) {\n        apk_scanner_report_list(fieldFilter: {id: $reportObjectId, android_app_id_reference: $appObjectId, scanner_name: $scannerName}) {\n            id\n            reportDate\n            scannerName\n            scannerVersion\n            scanStatus\n            androidAppIdReference {\n                id\n                filename\n                firmwareIdReference {\n                    id\n                }\n            }\n            ...MetaReportFields \n        }\n    }\n": typeof types.GetReportDocument,
    "\n    query GetScannerReport(\n        $reportObjectId: String\n    ) {\n        apk_scanner_report_list(fieldFilter: {id: $reportObjectId}) {\n            pk\n            reportDate\n            scanStatus\n            scannerName\n            scannerVersion\n            ...AndroGuardReportType\n            ...ApkidReportType\n            ...ApkleaksReportType\n            ...ExodusReportType\n            ...TrueseeingReportType\n            ...AndrowarnReportType\n            ...QuarkEngineReportType\n            ...QarkReportType\n            ...SuperReportType\n            ...VirusTotalReportType\n            ...MobSFSReportType\n            ...APKscanReportType\n            ...FlowDroidReportType\n        }\n    }\n": typeof types.GetScannerReportDocument,
    "\n    fragment AndroGuardReportType on AndroGuardReport {\n        activities\n        androidVersionCode\n        androidVersionName\n        appName\n        dexNames\n        effectiveTargetVersion\n        fileNameList\n        intentFiltersDict\n        isAndroidtv\n        isLeanback\n        isMultidex\n        isSignedV1\n        isSignedV2\n        isSignedV3\n        isValidApk\n        isWearable\n        mainActivity\n        mainActivityList\n        manifestFeatures\n        manifestLibraries\n        manifestXml\n        maxSdkVersion\n        minSdkVersion\n        packagename\n        permissionDetails\n        permissions\n        permissionsDeclared\n        permissionsDeclaredDetails\n        permissionsImplied\n        permissionsRequestedThirdParty\n        providers\n        receivers\n        services\n        signatureNames\n        targetSdkVersion\n        reportDate\n        scanStatus\n        scannerName\n        scannerVersion\n    }\n": typeof types.AndroGuardReportTypeFragmentDoc,
    "\n    fragment ApkidReportType on ApkidReport {\n        results\n    }\n": typeof types.ApkidReportTypeFragmentDoc,
    "\n    fragment ApkleaksReportType on ApkleaksReport {\n        results\n    }\n": typeof types.ApkleaksReportTypeFragmentDoc,
    "\n    fragment ExodusReportType on ExodusReport {\n        results\n    }\n": typeof types.ExodusReportTypeFragmentDoc,
    "\n    fragment TrueseeingReportType on TrueseeingReport {\n        results\n    }\n": typeof types.TrueseeingReportTypeFragmentDoc,
    "\n    fragment AndrowarnReportType on AndrowarnReport {\n        results\n    }\n": typeof types.AndrowarnReportTypeFragmentDoc,
    "\n    fragment QuarkEngineReportType on QuarkEngineReport {\n        results\n    }\n": typeof types.QuarkEngineReportTypeFragmentDoc,
    "\n    fragment QarkReportType on QarkReport {\n        results\n    }\n": typeof types.QarkReportTypeFragmentDoc,
    "\n    fragment SuperReportType on SuperReport {\n        results\n    }\n": typeof types.SuperReportTypeFragmentDoc,
    "\n    fragment VirusTotalReportType on VirusTotalReport {\n        fileInfo\n        analysisId\n        virusTotalAnalysis\n    }\n": typeof types.VirusTotalReportTypeFragmentDoc,
    "\n    fragment MobSFSReportType on MobSFScanReport {\n        results\n    }\n": typeof types.MobSfsReportTypeFragmentDoc,
    "\n    fragment APKscanReportType on APKscanReport {\n        results\n    }\n": typeof types.ApKscanReportTypeFragmentDoc,
    "\n    fragment FlowDroidReportType on FlowDroidReport {\n        results\n    }\n": typeof types.FlowDroidReportTypeFragmentDoc,
    "\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            queueName\n            startedAt\n            status\n        }\n    }\n": typeof types.GetRqJobListDocument,
    "\n    query GetRqJobQueueNames {\n        rq_queue_name_list\n    }\n": typeof types.GetRqJobQueueNamesDocument,
};
const documents: Documents = {
    "\n    query GetApiHealth {\n        isApiUp\n    }\n": types.GetApiHealthDocument,
    "\n    query GetApkScannerLogs{\n        apk_scanner_log_list {\n            id\n            level\n            message\n            module\n            tags\n            timestamp\n            threadName\n            thread\n            method\n            loggerName\n            lineNumber\n            fileName\n            details\n        }\n    }\n": types.GetApkScannerLogsDocument,
    "\n    mutation CreateAppImportJob($queueName: String!, $storageIndex: Int!) {\n        createAppImportJob(\n            queueName: $queueName,\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": types.CreateAppImportJobDocument,
    "\n    fragment AppAll on AndroidAppType {\n        absoluteStorePath\n        androidManifestDict\n        fileSizeBytes\n        filename\n        id\n        indexedDate\n        md5\n        originalFilename\n        packagename\n        partitionName\n        pk\n        relativeFirmwarePath\n        relativeStorePath\n        sha1\n        sha256\n        firmwareIdReference {\n            id\n        }\n        firmwareFileReference {\n            id\n        }\n    }\n": types.AppAllFragmentDoc,
    "\n    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    androidAppIdList {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": types.GetAppsByFirmwareObjectIdsDocument,
    "\n    query GetAppById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    androidAppIdList(id: $id) {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": types.GetAppByIdDocument,
    "\n    query GetScannerModuleNames {\n        scanner_module_name_list\n    }\n": types.GetScannerModuleNamesDocument,
    "\n    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {\n        createApkScanJob(\n            objectIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: $queueName,\n        ) {\n            jobIdList\n        }\n    }\n": types.ScanApksByObjectIdsDocument,
    "\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            payload\n        }\n    }\n": types.GetAuthTokenDocument,
    "\n    mutation DeleteTokenCookie {\n        deleteTokenCookie {\n            deleted\n        }\n    }\n": types.DeleteTokenCookieDocument,
    "\n    query GetCurrentUserId {\n        me {\n            id\n        }\n    }\n": types.GetCurrentUserIdDocument,
    "\n    query GetCurrentUserEmailAndUsername {\n        me {\n            email\n            username\n        }\n    }\n": types.GetCurrentUserEmailAndUsernameDocument,
    "\n    fragment FileAll on FirmwareFileType {\n        id\n        name\n        absoluteStorePath\n        fileSizeBytes\n        indexedDate\n        isDirectory\n        isOnDisk\n        isSymlink\n        md5\n        metaDict\n        parentDir\n        partitionName\n        relativePath\n        firmwareIdReference {\n            id\n        }\n        androidAppReference {\n            id\n        }\n    }\n": types.FileAllFragmentDoc,
    "\n    query GetFilesByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    firmwareFileIdList {\n                        edges {\n                            node {\n                                ...FileAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": types.GetFilesByFirmwareObjectIdsDocument,
    "\n    query GetFileById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    firmwareFileIdList(id: $id) {\n                        edges {\n                            node {\n                                ...FileAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n": types.GetFileByIdDocument,
    "\n    mutation CreateFirmwareExtractorJob($queueName: String!, $storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: $queueName\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n": types.CreateFirmwareExtractorJobDocument,
    "\n    fragment FirmwareAll on AndroidFirmwareType {\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        id\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        pk\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n    }\n": types.FirmwareAllFragmentDoc,
    "\n    query GetFirmwaresByObjectIds(\n        $objectIds: [String!]\n        $first: Int\n        $after: String\n    ) {\n        android_firmware_connection(\n            objectIdList: $objectIds\n            first: $first\n            after: $after\n        ) {\n            edges {\n                cursor\n                node {\n                    ...FirmwareAll\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n": types.GetFirmwaresByObjectIdsDocument,
    "\n    fragment FirmwareRowImporterPage on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n": types.FirmwareRowImporterPageFragmentDoc,
    "\n    query GetFirmwaresImporterPage($first: Int, $after: String) {\n        android_firmware_connection(first: $first, after: $after) {\n            edges {\n                cursor\n                node {\n                    ...FirmwareRowImporterPage\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n": types.GetFirmwaresImporterPageDocument,
    "\n    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {\n        createApkScanJob(\n            firmwareIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: $queueName,\n        ) {\n            jobIdList\n        }\n    }\n": types.ScanApksByFirmwareObjectIdsDocument,
    "\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n": types.DeleteFirmwareByObjectIdDocument,
    "\n    fragment MetaReportFields on ApkScannerReportInterface {\n        reportDate\n        scannerName\n        scannerVersion\n        scanStatus\n        androidAppIdReference {\n            id\n            filename\n            firmwareIdReference {\n                id\n            }\n        }\n    }\n": types.MetaReportFieldsFragmentDoc,
    "\n    fragment ApkScannerReport on ApkScannerReportInterface {\n        ...AndroGuardReportType\n        ...ApkidReportType\n        ...ApkleaksReportType\n        ...ExodusReportType\n        ...TrueseeingReportType\n        ...AndrowarnReportType\n        ...QuarkEngineReportType\n        ...QarkReportType\n        ...SuperReportType\n        ...VirusTotalReportType\n        ...MobSFSReportType\n        ...APKscanReportType\n        ...FlowDroidReportType\n    }\n": types.ApkScannerReportFragmentDoc,
    "\n    query GetReport($reportObjectId: String, $appObjectId: String, $scannerName: String) {\n        apk_scanner_report_list(fieldFilter: {id: $reportObjectId, android_app_id_reference: $appObjectId, scanner_name: $scannerName}) {\n            id\n            reportDate\n            scannerName\n            scannerVersion\n            scanStatus\n            androidAppIdReference {\n                id\n                filename\n                firmwareIdReference {\n                    id\n                }\n            }\n            ...MetaReportFields \n        }\n    }\n": types.GetReportDocument,
    "\n    query GetScannerReport(\n        $reportObjectId: String\n    ) {\n        apk_scanner_report_list(fieldFilter: {id: $reportObjectId}) {\n            pk\n            reportDate\n            scanStatus\n            scannerName\n            scannerVersion\n            ...AndroGuardReportType\n            ...ApkidReportType\n            ...ApkleaksReportType\n            ...ExodusReportType\n            ...TrueseeingReportType\n            ...AndrowarnReportType\n            ...QuarkEngineReportType\n            ...QarkReportType\n            ...SuperReportType\n            ...VirusTotalReportType\n            ...MobSFSReportType\n            ...APKscanReportType\n            ...FlowDroidReportType\n        }\n    }\n": types.GetScannerReportDocument,
    "\n    fragment AndroGuardReportType on AndroGuardReport {\n        activities\n        androidVersionCode\n        androidVersionName\n        appName\n        dexNames\n        effectiveTargetVersion\n        fileNameList\n        intentFiltersDict\n        isAndroidtv\n        isLeanback\n        isMultidex\n        isSignedV1\n        isSignedV2\n        isSignedV3\n        isValidApk\n        isWearable\n        mainActivity\n        mainActivityList\n        manifestFeatures\n        manifestLibraries\n        manifestXml\n        maxSdkVersion\n        minSdkVersion\n        packagename\n        permissionDetails\n        permissions\n        permissionsDeclared\n        permissionsDeclaredDetails\n        permissionsImplied\n        permissionsRequestedThirdParty\n        providers\n        receivers\n        services\n        signatureNames\n        targetSdkVersion\n        reportDate\n        scanStatus\n        scannerName\n        scannerVersion\n    }\n": types.AndroGuardReportTypeFragmentDoc,
    "\n    fragment ApkidReportType on ApkidReport {\n        results\n    }\n": types.ApkidReportTypeFragmentDoc,
    "\n    fragment ApkleaksReportType on ApkleaksReport {\n        results\n    }\n": types.ApkleaksReportTypeFragmentDoc,
    "\n    fragment ExodusReportType on ExodusReport {\n        results\n    }\n": types.ExodusReportTypeFragmentDoc,
    "\n    fragment TrueseeingReportType on TrueseeingReport {\n        results\n    }\n": types.TrueseeingReportTypeFragmentDoc,
    "\n    fragment AndrowarnReportType on AndrowarnReport {\n        results\n    }\n": types.AndrowarnReportTypeFragmentDoc,
    "\n    fragment QuarkEngineReportType on QuarkEngineReport {\n        results\n    }\n": types.QuarkEngineReportTypeFragmentDoc,
    "\n    fragment QarkReportType on QarkReport {\n        results\n    }\n": types.QarkReportTypeFragmentDoc,
    "\n    fragment SuperReportType on SuperReport {\n        results\n    }\n": types.SuperReportTypeFragmentDoc,
    "\n    fragment VirusTotalReportType on VirusTotalReport {\n        fileInfo\n        analysisId\n        virusTotalAnalysis\n    }\n": types.VirusTotalReportTypeFragmentDoc,
    "\n    fragment MobSFSReportType on MobSFScanReport {\n        results\n    }\n": types.MobSfsReportTypeFragmentDoc,
    "\n    fragment APKscanReportType on APKscanReport {\n        results\n    }\n": types.ApKscanReportTypeFragmentDoc,
    "\n    fragment FlowDroidReportType on FlowDroidReport {\n        results\n    }\n": types.FlowDroidReportTypeFragmentDoc,
    "\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            queueName\n            startedAt\n            status\n        }\n    }\n": types.GetRqJobListDocument,
    "\n    query GetRqJobQueueNames {\n        rq_queue_name_list\n    }\n": types.GetRqJobQueueNamesDocument,
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
export function gql(source: "\n    query GetApkScannerLogs{\n        apk_scanner_log_list {\n            id\n            level\n            message\n            module\n            tags\n            timestamp\n            threadName\n            thread\n            method\n            loggerName\n            lineNumber\n            fileName\n            details\n        }\n    }\n"): (typeof documents)["\n    query GetApkScannerLogs{\n        apk_scanner_log_list {\n            id\n            level\n            message\n            module\n            tags\n            timestamp\n            threadName\n            thread\n            method\n            loggerName\n            lineNumber\n            fileName\n            details\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateAppImportJob($queueName: String!, $storageIndex: Int!) {\n        createAppImportJob(\n            queueName: $queueName,\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"): (typeof documents)["\n    mutation CreateAppImportJob($queueName: String!, $storageIndex: Int!) {\n        createAppImportJob(\n            queueName: $queueName,\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment AppAll on AndroidAppType {\n        absoluteStorePath\n        androidManifestDict\n        fileSizeBytes\n        filename\n        id\n        indexedDate\n        md5\n        originalFilename\n        packagename\n        partitionName\n        pk\n        relativeFirmwarePath\n        relativeStorePath\n        sha1\n        sha256\n        firmwareIdReference {\n            id\n        }\n        firmwareFileReference {\n            id\n        }\n    }\n"): (typeof documents)["\n    fragment AppAll on AndroidAppType {\n        absoluteStorePath\n        androidManifestDict\n        fileSizeBytes\n        filename\n        id\n        indexedDate\n        md5\n        originalFilename\n        packagename\n        partitionName\n        pk\n        relativeFirmwarePath\n        relativeStorePath\n        sha1\n        sha256\n        firmwareIdReference {\n            id\n        }\n        firmwareFileReference {\n            id\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    androidAppIdList {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetAppsByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    androidAppIdList {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetAppById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    androidAppIdList(id: $id) {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetAppById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    androidAppIdList(id: $id) {\n                        edges {\n                            node {\n                                ...AppAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetScannerModuleNames {\n        scanner_module_name_list\n    }\n"): (typeof documents)["\n    query GetScannerModuleNames {\n        scanner_module_name_list\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {\n        createApkScanJob(\n            objectIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: $queueName,\n        ) {\n            jobIdList\n        }\n    }\n"): (typeof documents)["\n    mutation ScanApksByObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {\n        createApkScanJob(\n            objectIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: $queueName,\n        ) {\n            jobIdList\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            payload\n        }\n    }\n"): (typeof documents)["\n    query GetAuthToken($password: String!, $username: String!) {\n        tokenAuth(password: $password, username: $username) {\n            payload\n        }\n    }\n"];
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
export function gql(source: "\n    fragment FileAll on FirmwareFileType {\n        id\n        name\n        absoluteStorePath\n        fileSizeBytes\n        indexedDate\n        isDirectory\n        isOnDisk\n        isSymlink\n        md5\n        metaDict\n        parentDir\n        partitionName\n        relativePath\n        firmwareIdReference {\n            id\n        }\n        androidAppReference {\n            id\n        }\n    }\n"): (typeof documents)["\n    fragment FileAll on FirmwareFileType {\n        id\n        name\n        absoluteStorePath\n        fileSizeBytes\n        indexedDate\n        isDirectory\n        isOnDisk\n        isSymlink\n        md5\n        metaDict\n        parentDir\n        partitionName\n        relativePath\n        firmwareIdReference {\n            id\n        }\n        androidAppReference {\n            id\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFilesByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    firmwareFileIdList {\n                        edges {\n                            node {\n                                ...FileAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetFilesByFirmwareObjectIds($objectIds: [String!]) {\n        android_firmware_connection(objectIdList: $objectIds) {\n            edges {\n                node {\n                    firmwareFileIdList {\n                        edges {\n                            node {\n                                ...FileAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFileById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    firmwareFileIdList(id: $id) {\n                        edges {\n                            node {\n                                ...FileAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetFileById($id: ID!) {\n        android_firmware_connection {\n            edges {\n                node {\n                    firmwareFileIdList(id: $id) {\n                        edges {\n                            node {\n                                ...FileAll\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateFirmwareExtractorJob($queueName: String!, $storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: $queueName\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"): (typeof documents)["\n    mutation CreateFirmwareExtractorJob($queueName: String!, $storageIndex: Int!) {\n        createFirmwareExtractorJob(\n            createFuzzyHashes: false\n            queueName: $queueName\n            storageIndex: $storageIndex\n        ) {\n            jobId\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment FirmwareAll on AndroidFirmwareType {\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        id\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        pk\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n    }\n"): (typeof documents)["\n    fragment FirmwareAll on AndroidFirmwareType {\n        absoluteStorePath\n        aecsBuildFilePath\n        fileSizeBytes\n        filename\n        hasFileIndex\n        hasFuzzyHashIndex\n        id\n        indexedDate\n        md5\n        originalFilename\n        osVendor\n        partitionInfoDict\n        pk\n        relativeStorePath\n        sha1\n        sha256\n        tag\n        versionDetected\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFirmwaresByObjectIds(\n        $objectIds: [String!]\n        $first: Int\n        $after: String\n    ) {\n        android_firmware_connection(\n            objectIdList: $objectIds\n            first: $first\n            after: $after\n        ) {\n            edges {\n                cursor\n                node {\n                    ...FirmwareAll\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetFirmwaresByObjectIds(\n        $objectIds: [String!]\n        $first: Int\n        $after: String\n    ) {\n        android_firmware_connection(\n            objectIdList: $objectIds\n            first: $first\n            after: $after\n        ) {\n            edges {\n                cursor\n                node {\n                    ...FirmwareAll\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment FirmwareRowImporterPage on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n"): (typeof documents)["\n    fragment FirmwareRowImporterPage on AndroidFirmwareType {\n        id\n        indexedDate\n        originalFilename\n        osVendor\n        versionDetected\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetFirmwaresImporterPage($first: Int, $after: String) {\n        android_firmware_connection(first: $first, after: $after) {\n            edges {\n                cursor\n                node {\n                    ...FirmwareRowImporterPage\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetFirmwaresImporterPage($first: Int, $after: String) {\n        android_firmware_connection(first: $first, after: $after) {\n            edges {\n                cursor\n                node {\n                    ...FirmwareRowImporterPage\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {\n        createApkScanJob(\n            firmwareIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: $queueName,\n        ) {\n            jobIdList\n        }\n    }\n"): (typeof documents)["\n    mutation ScanApksByFirmwareObjectIds($objectIds: [String!]!, $scannerName: String!, $queueName: String!) {\n        createApkScanJob(\n            firmwareIdList: $objectIds,\n            moduleName: $scannerName,\n            queueName: $queueName,\n        ) {\n            jobIdList\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteFirmwareByObjectId($objectIds: [String!]!) {\n        deleteAndroidFirmware(firmwareIdList: $objectIds) {\n            jobId\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment MetaReportFields on ApkScannerReportInterface {\n        reportDate\n        scannerName\n        scannerVersion\n        scanStatus\n        androidAppIdReference {\n            id\n            filename\n            firmwareIdReference {\n                id\n            }\n        }\n    }\n"): (typeof documents)["\n    fragment MetaReportFields on ApkScannerReportInterface {\n        reportDate\n        scannerName\n        scannerVersion\n        scanStatus\n        androidAppIdReference {\n            id\n            filename\n            firmwareIdReference {\n                id\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment ApkScannerReport on ApkScannerReportInterface {\n        ...AndroGuardReportType\n        ...ApkidReportType\n        ...ApkleaksReportType\n        ...ExodusReportType\n        ...TrueseeingReportType\n        ...AndrowarnReportType\n        ...QuarkEngineReportType\n        ...QarkReportType\n        ...SuperReportType\n        ...VirusTotalReportType\n        ...MobSFSReportType\n        ...APKscanReportType\n        ...FlowDroidReportType\n    }\n"): (typeof documents)["\n    fragment ApkScannerReport on ApkScannerReportInterface {\n        ...AndroGuardReportType\n        ...ApkidReportType\n        ...ApkleaksReportType\n        ...ExodusReportType\n        ...TrueseeingReportType\n        ...AndrowarnReportType\n        ...QuarkEngineReportType\n        ...QarkReportType\n        ...SuperReportType\n        ...VirusTotalReportType\n        ...MobSFSReportType\n        ...APKscanReportType\n        ...FlowDroidReportType\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetReport($reportObjectId: String, $appObjectId: String, $scannerName: String) {\n        apk_scanner_report_list(fieldFilter: {id: $reportObjectId, android_app_id_reference: $appObjectId, scanner_name: $scannerName}) {\n            id\n            reportDate\n            scannerName\n            scannerVersion\n            scanStatus\n            androidAppIdReference {\n                id\n                filename\n                firmwareIdReference {\n                    id\n                }\n            }\n            ...MetaReportFields \n        }\n    }\n"): (typeof documents)["\n    query GetReport($reportObjectId: String, $appObjectId: String, $scannerName: String) {\n        apk_scanner_report_list(fieldFilter: {id: $reportObjectId, android_app_id_reference: $appObjectId, scanner_name: $scannerName}) {\n            id\n            reportDate\n            scannerName\n            scannerVersion\n            scanStatus\n            androidAppIdReference {\n                id\n                filename\n                firmwareIdReference {\n                    id\n                }\n            }\n            ...MetaReportFields \n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetScannerReport(\n        $reportObjectId: String\n    ) {\n        apk_scanner_report_list(fieldFilter: {id: $reportObjectId}) {\n            pk\n            reportDate\n            scanStatus\n            scannerName\n            scannerVersion\n            ...AndroGuardReportType\n            ...ApkidReportType\n            ...ApkleaksReportType\n            ...ExodusReportType\n            ...TrueseeingReportType\n            ...AndrowarnReportType\n            ...QuarkEngineReportType\n            ...QarkReportType\n            ...SuperReportType\n            ...VirusTotalReportType\n            ...MobSFSReportType\n            ...APKscanReportType\n            ...FlowDroidReportType\n        }\n    }\n"): (typeof documents)["\n    query GetScannerReport(\n        $reportObjectId: String\n    ) {\n        apk_scanner_report_list(fieldFilter: {id: $reportObjectId}) {\n            pk\n            reportDate\n            scanStatus\n            scannerName\n            scannerVersion\n            ...AndroGuardReportType\n            ...ApkidReportType\n            ...ApkleaksReportType\n            ...ExodusReportType\n            ...TrueseeingReportType\n            ...AndrowarnReportType\n            ...QuarkEngineReportType\n            ...QarkReportType\n            ...SuperReportType\n            ...VirusTotalReportType\n            ...MobSFSReportType\n            ...APKscanReportType\n            ...FlowDroidReportType\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment AndroGuardReportType on AndroGuardReport {\n        activities\n        androidVersionCode\n        androidVersionName\n        appName\n        dexNames\n        effectiveTargetVersion\n        fileNameList\n        intentFiltersDict\n        isAndroidtv\n        isLeanback\n        isMultidex\n        isSignedV1\n        isSignedV2\n        isSignedV3\n        isValidApk\n        isWearable\n        mainActivity\n        mainActivityList\n        manifestFeatures\n        manifestLibraries\n        manifestXml\n        maxSdkVersion\n        minSdkVersion\n        packagename\n        permissionDetails\n        permissions\n        permissionsDeclared\n        permissionsDeclaredDetails\n        permissionsImplied\n        permissionsRequestedThirdParty\n        providers\n        receivers\n        services\n        signatureNames\n        targetSdkVersion\n        reportDate\n        scanStatus\n        scannerName\n        scannerVersion\n    }\n"): (typeof documents)["\n    fragment AndroGuardReportType on AndroGuardReport {\n        activities\n        androidVersionCode\n        androidVersionName\n        appName\n        dexNames\n        effectiveTargetVersion\n        fileNameList\n        intentFiltersDict\n        isAndroidtv\n        isLeanback\n        isMultidex\n        isSignedV1\n        isSignedV2\n        isSignedV3\n        isValidApk\n        isWearable\n        mainActivity\n        mainActivityList\n        manifestFeatures\n        manifestLibraries\n        manifestXml\n        maxSdkVersion\n        minSdkVersion\n        packagename\n        permissionDetails\n        permissions\n        permissionsDeclared\n        permissionsDeclaredDetails\n        permissionsImplied\n        permissionsRequestedThirdParty\n        providers\n        receivers\n        services\n        signatureNames\n        targetSdkVersion\n        reportDate\n        scanStatus\n        scannerName\n        scannerVersion\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment ApkidReportType on ApkidReport {\n        results\n    }\n"): (typeof documents)["\n    fragment ApkidReportType on ApkidReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment ApkleaksReportType on ApkleaksReport {\n        results\n    }\n"): (typeof documents)["\n    fragment ApkleaksReportType on ApkleaksReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment ExodusReportType on ExodusReport {\n        results\n    }\n"): (typeof documents)["\n    fragment ExodusReportType on ExodusReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment TrueseeingReportType on TrueseeingReport {\n        results\n    }\n"): (typeof documents)["\n    fragment TrueseeingReportType on TrueseeingReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment AndrowarnReportType on AndrowarnReport {\n        results\n    }\n"): (typeof documents)["\n    fragment AndrowarnReportType on AndrowarnReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment QuarkEngineReportType on QuarkEngineReport {\n        results\n    }\n"): (typeof documents)["\n    fragment QuarkEngineReportType on QuarkEngineReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment QarkReportType on QarkReport {\n        results\n    }\n"): (typeof documents)["\n    fragment QarkReportType on QarkReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment SuperReportType on SuperReport {\n        results\n    }\n"): (typeof documents)["\n    fragment SuperReportType on SuperReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment VirusTotalReportType on VirusTotalReport {\n        fileInfo\n        analysisId\n        virusTotalAnalysis\n    }\n"): (typeof documents)["\n    fragment VirusTotalReportType on VirusTotalReport {\n        fileInfo\n        analysisId\n        virusTotalAnalysis\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment MobSFSReportType on MobSFScanReport {\n        results\n    }\n"): (typeof documents)["\n    fragment MobSFSReportType on MobSFScanReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment APKscanReportType on APKscanReport {\n        results\n    }\n"): (typeof documents)["\n    fragment APKscanReportType on APKscanReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment FlowDroidReportType on FlowDroidReport {\n        results\n    }\n"): (typeof documents)["\n    fragment FlowDroidReportType on FlowDroidReport {\n        results\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            queueName\n            startedAt\n            status\n        }\n    }\n"): (typeof documents)["\n    query GetRqJobList {\n        rq_job_list {\n            description\n            funcName\n            id\n            isFailed\n            isFinished\n            queueName\n            startedAt\n            status\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetRqJobQueueNames {\n        rq_queue_name_list\n    }\n"): (typeof documents)["\n    query GetRqJobQueueNames {\n        rq_queue_name_list\n    }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;