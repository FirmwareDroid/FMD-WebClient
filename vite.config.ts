import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.{ts,tsx,js,jsx}'],
            exclude: ['src/__generated__/**', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
        },
    },
    build: {
        outDir: 'build',
    },
    // Bootstrap's internal SCSS is still using deprecated @import and some legacy color/math helpers.
    // To make the build process less noisy, related warnings are silenced.
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
            },
        },
    },
});
