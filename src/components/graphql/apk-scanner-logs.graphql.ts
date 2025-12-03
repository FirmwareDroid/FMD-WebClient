import {gql} from "@/__generated__";

export const GET_APK_SCANNER_LOGS = gql(`
    query GetApkScannerLogs{
        apk_scanner_log_list {
            id
            level
            message
            module
            tags
            timestamp
            threadName
            thread
            method
            loggerName
            lineNumber
            fileName
            details
        }
    }
`);