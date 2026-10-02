import { gql } from "@/__generated__";

export const GET_FIRMWARE_BUILD_PROPS = gql(`
    query GetFirmwareBuildProps($firmwareId: String!) {
        build_prop_file_id_list(fieldFilter: { firmware_id_reference: $firmwareId }) {
            id
            pk
            properties
            propertyKeys
            firmwareFileIdReference {
                id
                pk
                name
                relativePath
                partitionName
                fileSizeBytes
            }
        }
    }
`);
