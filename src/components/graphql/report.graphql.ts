import {gql} from "@/__generated__";

export const BASIC_REPORT_INFO = gql(`
    fragment BasicReportInfo on ApkScannerReportType {
        id
        reportDate
        scannerName
        scannerVersion
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
        files
        rulesSha256
        reportFileJson {
            data
        }
        reportDate
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
        scannerName
        scannerVersion
    }
`);
