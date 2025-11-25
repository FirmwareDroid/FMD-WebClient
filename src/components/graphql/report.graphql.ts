import {gql} from "@/__generated__";

export const BASIC_REPORT_INFO = gql(`
    fragment BasicReportInfo on ApkScannerReportType {
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
    }
`);

export const GET_REPORT = gql(`
    query GetReport($reportObjectId: String, $appObjectId: String, $scannerName: String) {
        apk_scanner_report_list(fieldFilter: {id: $reportObjectId, android_app_id_reference: $appObjectId, scanner_name: $scannerName}) {
            ...BasicReportInfo
        }
    }
`);

export const GET_SCANNER_REPORT = gql(`
    query GetScannerReport(
        $reportObjectId: String
        $wantAndroguard: Boolean! = false
        $wantApkid: Boolean! = false
        $wantApkleaks: Boolean! = false
        $wantExodus: Boolean! = false
        $wantTrueseeing: Boolean! = false
        $wantAndrowarn: Boolean! = false
        $wantQuarkEngine: Boolean! = false
        $wantQark: Boolean! = false
        $wantSuper: Boolean! = false
        $wantVirusTotal: Boolean! = false
        $wantMobsfs: Boolean! = false
        $wantApkscan: Boolean! = false
        $wantFlowDroid: Boolean! = false
    ) {
        apk_scanner_report_list(fieldFilter: {id: $reportObjectId}) {
            androidAppIdReference {
                id
                filename
                firmwareIdReference {
                    id
                }
                
                androguardReport: androguardReportReference @include(if: $wantAndroguard) {
                    ...AndroguardReport
                }
                apkidReport: apkidReportReference @include(if: $wantApkid) {
                    ...ApkidReport
                }
                apkleaksReport: apkleaksReportReference @include(if: $wantApkleaks) {
                    ...ApkleaksReport
                }
                exodusReport: exodusReportReference @include(if: $wantExodus) {
                    ...ExodusReport
                }
                trueseeingReport: trueseeingReportReference @include(if: $wantTrueseeing) {
                    ...TrueseeingReport
                }
                androwarnReport: androwarnReportReference @include(if: $wantAndrowarn) {
                    ...AndrowarnReport
                }
                quarkEngineReport: quarkEngineReportReference @include(if: $wantQuarkEngine) {
                    ...QuarkEngineReport
                }
                qarkReport: qarkReportReference @include(if: $wantQark) {
                    ...QarkReport
                }
                superReport: superReportReference @include(if: $wantSuper) {
                    ...SuperReport
                }
                virustotalReport: virustotalReportReference @include(if: $wantVirusTotal) {
                    ...VirusTotalReport
                }
                mobsfReport: mobsfscanReportReference @include(if: $wantMobsfs) {
                    ...MobSFSReport
                }
                apkscanReport: apkscanReportReference @include(if: $wantApkscan) {
                    ...APKscanReport
                }
                flowdroidReport: flowdroidReportReference @include(if: $wantFlowDroid) {
                    ...FlowDroidReport
                }
            }
        }
    }
`);





// ----------------------------------------------------------------------------------------------------
// AndroGuard REPORT
// ----------------------------------------------------------------------------------------------------

export const ANDROGUARD_REPORT = gql(`
    fragment AndroguardReport on AndroGuardReportType {
        id
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
    fragment ApkidReport on ApkidReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// APKLeaks REPORT
// ----------------------------------------------------------------------------------------------------

export const APKLEAKS_REPORT = gql(`
    fragment ApkleaksReport on ApkleaksReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// Exodus REPORT
// ----------------------------------------------------------------------------------------------------

export const EXODUS_REPORT = gql(`
    fragment ExodusReport on ExodusReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// Trueseeing REPORT
// ----------------------------------------------------------------------------------------------------

export const TRUESEEING_REPORT = gql(`
    fragment TrueseeingReport on TrueseeingReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// Androwarn REPORT
// ----------------------------------------------------------------------------------------------------

export const ANDROWARN_REPORT = gql(`
    fragment AndrowarnReport on AndrowarnReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// QuarkEngine REPORT
// ----------------------------------------------------------------------------------------------------

export const QUARK_ENGINE_REPORT = gql(`
    fragment QuarkEngineReport on QuarkEngineReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// Qark REPORT
// ----------------------------------------------------------------------------------------------------

export const QARK_REPORT = gql(`
    fragment QarkReport on QarkReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// Super REPORT
// ----------------------------------------------------------------------------------------------------

export const SUPER_REPORT = gql(`
    fragment SuperReport on SuperReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// VirusTotal REPORT
// ----------------------------------------------------------------------------------------------------

export const VIRUSTOTAL_REPORT = gql(`
    fragment VirusTotalReport on VirustotalReportType {
        id
        fileInfo
        analysisId
        virusTotalAnalysis
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// MobSFS REPORT
// ----------------------------------------------------------------------------------------------------

export const MOBSFS_REPORT = gql(`
    fragment MobSFSReport on MobSFScanReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// Apkscan REPORT
// ----------------------------------------------------------------------------------------------------

export const APKSCAN_REPORT = gql(`
    fragment APKscanReport on APKscanReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);

// ----------------------------------------------------------------------------------------------------
// FlowDroid REPORT
// ----------------------------------------------------------------------------------------------------

export const FLOWDROID_REPORT = gql(`
    fragment FlowDroidReport on FlowDroidReportType {
        id
        results
        reportDate
        scanStatus
        scannerName
        scannerVersion
    }
`);


