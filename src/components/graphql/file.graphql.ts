import {gql} from "@/__generated__";

export const FILE_LIST_ITEM = gql(`
    fragment FileListItem on FirmwareFileType {
        id
        pk
        name
        relativePath
        parentDir
        partitionName
        fileSizeBytes
        indexedDate
        isDirectory
        isSymlink
        isOnDisk
        md5
        firmwareIdReference {
            id
        }
        androidAppReference {
            id
        }
    }
`);

export const FILE_ALL = gql(`
    fragment FileAll on FirmwareFileType {
        id
        pk
        name
        relativePath
        parentDir
        partitionName
        fileSizeBytes
        indexedDate
        isDirectory
        isSymlink
        isOnDisk
        md5
        metaDict
        absoluteStorePath
        firmwareIdReference {
            id
            filename
        }
        androidAppReference {
            id
            packagename
            filename
        }
        tlshReference {
            digest
        }
    }
`);

export const GET_FILES_BY_FIRMWARE = gql(`
    query GetFilesByFirmware($filter: FirmwareFileFilter, $limit: Int, $offset: Int) {
        firmware_file_list(fieldFilter: $filter, limit: $limit, offset: $offset) {
            ...FileListItem
        }
        firmware_file_count(fieldFilter: $filter)
    }
`);

export const GET_FILE_BY_OBJECT_ID = gql(`
    query GetFileByObjectId($objectIdList: [String]) {
        firmware_file_list(objectIdList: $objectIdList) {
            ...FileAll
        }
    }
`);
