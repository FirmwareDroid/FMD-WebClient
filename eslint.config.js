import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import {globalIgnores} from 'eslint/config'

export default tseslint.config([
    globalIgnores(['dist', 'build', 'src/__generated__', '**/*_old.tsx.txt']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            reactHooks.configs.flat['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        linterOptions: {
            reportUnusedDisableDirectives: "off",
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "no-empty": "off",
            "react-hooks/exhaustive-deps": "off",
            "react-hooks/immutability": "off",
            "react-hooks/incompatible-library": "off",
            "react-hooks/purity": "off",
            "react-hooks/refs": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-refresh/only-export-components": "off",
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            'no-var': 'off',
        },
    },
])
