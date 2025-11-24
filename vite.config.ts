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
