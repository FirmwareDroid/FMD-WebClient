import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: './schema/schema.graphql',
    // All GraphQL queries/mutations/subscriptions must be in src/graphql/ and end with .graphql.ts(x)
    documents: ['src/components/**/*.graphql.{ts,tsx}'],
    generates: {
        './src/__generated__/': {
            preset: 'client',
            plugins: [],
            presetConfig: {
                gqlTagName: 'gql',
            }
        }
    },
    ignoreNoDocuments: true,
};

export default config;