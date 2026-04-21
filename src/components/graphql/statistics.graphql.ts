import {gql} from "@/__generated__";

// ----------------------------------------------------------------------------------------------------
// GET FIRMWARE ID LIST (for count)
// ----------------------------------------------------------------------------------------------------

export const GET_FIRMWARE_ID_LIST = gql(`
    query GetFirmwareIdList {
        android_firmware_id_list
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET APP ID LIST (for count)
// ----------------------------------------------------------------------------------------------------

export const GET_APP_ID_LIST = gql(`
    query GetAppIdList {
        android_app_id_list
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET STATISTICS REPORTS
// ----------------------------------------------------------------------------------------------------

export const GET_STATISTICS_REPORT_LIST = gql(`
    query GetStatisticsReportList {
        statistics_report_list {
            id
            reportName
            reportDate
            androidAppCount
            reportCount
        }
    }
`);

// ----------------------------------------------------------------------------------------------------
// GET SCANNER-SPECIFIC STATISTICS
// ----------------------------------------------------------------------------------------------------

export const GET_APKLEAKS_STATISTICS = gql(`
    query GetApkleaksStatistics {
        apkleaks_statistics_report_list {
            id
            reportName
            reportDate
            androidAppCount
            reportCount
            leaksCountDict
        }
    }
`);

export const GET_EXODUS_STATISTICS = gql(`
    query GetExodusStatistics {
        exodus_statistics_report_list {
            id
            reportName
            reportDate
            androidAppCount
            reportCount
            trackerCountDict
        }
    }
`);

export const GET_SUPER_STATISTICS = gql(`
    query GetSuperStatistics {
        super_statistics_report_list {
            id
            reportName
            reportDate
            androidAppCount
            reportCount
        }
    }
`);
