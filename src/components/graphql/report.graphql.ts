import {gql} from "@/__generated__";


export const META_APK_SCANNER_REPORT = gql(`
    fragment MetaReportFields on ApkScannerReportInterface {
        reportDate
        scannerName
        scannerVersion
        scanStatus
        androidAppIdReference {
            id
            filename
            firmwareIdReference {
                id
            }
        }
    }
`);


export const APK_REPORT = gql(`
    fragment ApkScannerReport on ApkScannerReportInterface {
        ...AndroGuardReportType
        ...ApkidReportType
        ...ApkleaksReportType
        ...ExodusReportType
        ...TrueseeingReportType
        ...AndrowarnReportType
        ...QuarkEngineReportType
        ...QarkReportType
        ...SuperReportType
        ...VirusTotalReportType
        ...MobSFSReportType
        ...APKscanReportType
        ...FlowDroidReportType
    }
`);

export const GET_REPORT = gql(`
    query GetReport($reportObjectId: String, $appObjectId: String, $scannerName: String) {
        apk_scanner_report_list(fieldFilter: {id: $reportObjectId, android_app_id_reference: $appObjectId, scanner_name: $scannerName}) {
            id
            reportDate
            scannerName
            scannerVersion
            scanStatus
            androidAppIdReference {
                id
                filename
                firmwareIdReference {
                    id
                }
            }
            ...MetaReportFields 
        }
    }
`);

export const GET_SCANNER_REPORT = gql(`
    query GetScannerReport(
        $reportObjectId: String
    ) {
        apk_scanner_report_list(fieldFilter: {id: $reportObjectId}) {
            pk
            reportDate
            scanStatus
            scannerName
            scannerVersion
            ...AndroGuardReportType
            ...ApkidReportType
            ...ApkleaksReportType
            ...ExodusReportType
            ...TrueseeingReportType
            ...AndrowarnReportType
            ...QuarkEngineReportType
            ...QarkReportType
            ...SuperReportType
            ...VirusTotalReportType
            ...MobSFSReportType
            ...APKscanReportType
            ...FlowDroidReportType
        }
    }
`);


// ----------------------------------------------------------------------------------------------------
// AndroGuard REPORT
// ----------------------------------------------------------------------------------------------------

export const ANDROGUARD_REPORT = gql(`
    fragment AndroGuardReportType on AndroGuardReport {
        activities
        androidVersionCode
        androidVersionName
        appName
        dexNames
        effectiveTargetVersion
        fileNameList
        intentFiltersDict
        isAndroidtv
        isLeanback
        isMultidex
        isSignedV1
        isSignedV2
        isSignedV3
        isValidApk
        isWearable
        mainActivity
        mainActivityList
        manifestFeatures
        manifestLibraries
        manifestXml
        maxSdkVersion
        minSdkVersion
        packagename
        permissionDetails
        permissions
        permissionsDeclared
        permissionsDeclaredDetails
        permissionsImplied
        permissionsRequestedThirdParty
        providers
        receivers
        services
        signatureNames
        targetSdkVersion
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// APKiD REPORT
// ----------------------------------------------------------------------------------------------------

export const APKID_REPORT = gql(`
    fragment ApkidReportType on ApkidReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// APKLeaks REPORT
// ----------------------------------------------------------------------------------------------------

export const APKLEAKS_REPORT = gql(`
    fragment ApkleaksReportType on ApkleaksReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// Exodus REPORT
// ----------------------------------------------------------------------------------------------------

export const EXODUS_REPORT = gql(`
    fragment ExodusReportType on ExodusReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// Trueseeing REPORT
// ----------------------------------------------------------------------------------------------------

export const TRUESEEING_REPORT = gql(`
    fragment TrueseeingReportType on TrueseeingReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// Androwarn REPORT
// ----------------------------------------------------------------------------------------------------

export const ANDROWARN_REPORT = gql(`
    fragment AndrowarnReportType on AndrowarnReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// QuarkEngine REPORT
// ----------------------------------------------------------------------------------------------------

export const QUARK_ENGINE_REPORT = gql(`
    fragment QuarkEngineReportType on QuarkEngineReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// Qark REPORT
// ----------------------------------------------------------------------------------------------------

export const QARK_REPORT = gql(`
    fragment QarkReportType on QarkReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// Super REPORT
// ----------------------------------------------------------------------------------------------------

export const SUPER_REPORT = gql(`
    fragment SuperReportType on SuperReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// VirusTotal REPORT
// ----------------------------------------------------------------------------------------------------

export const VIRUSTOTAL_REPORT = gql(`
    fragment VirusTotalReportType on VirusTotalReport {
        fileInfo
        analysisId
        virusTotalAnalysis
    }
`);

// ----------------------------------------------------------------------------------------------------
// MobSFS REPORT
// ----------------------------------------------------------------------------------------------------

export const MOBSFS_REPORT = gql(`
    fragment MobSFSReportType on MobSFScanReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// Apkscan REPORT
// ----------------------------------------------------------------------------------------------------

export const APKSCAN_REPORT = gql(`
    fragment APKscanReportType on APKscanReport {
        results
    }
`);

// ----------------------------------------------------------------------------------------------------
// FlowDroid REPORT
// ----------------------------------------------------------------------------------------------------

export const FLOWDROID_REPORT = gql(`
    fragment FlowDroidReportType on FlowDroidReport {
        results
    }
`);


