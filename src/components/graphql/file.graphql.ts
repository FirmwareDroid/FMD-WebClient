import {gql} from "@/__generated__";

export const FILE_ALL = gql(`
    fragment FileAll on FirmwareFileType {
        id
        name
        absoluteStorePath
        fileSizeBytes
        indexedDate
        isDirectory
        isOnDisk
        isSymlink
        md5
        metaDict
        parentDir
        partitionName
        relativePath
        firmwareIdReference {
            id
        }
        androidAppReference {
            id
        }
    }
`);

export const GET_FILES_BY_FIRMWARE_OBJECT_IDS = gql(`
    query GetFilesByFirmwareObjectIds($objectIds: [String!]) {
        android_firmware_connection(objectIdList: $objectIds) {
            edges {
                node {
                    firmwareFileIdList {
                        edges {
                            node {
                                ...FileAll
                            }
                        }
                    }
                }
            }
        }
    }
`);

export const GET_FILE_BY_ID = gql(`
    query GetFileById($id: ID!) {
        android_firmware_connection {
            edges {
                node {
                    firmwareFileIdList(id: $id) {
                        edges {
                            node {
                                ...FileAll
                            }
                        }
                    }
                }
            }
        }
    }
`);
