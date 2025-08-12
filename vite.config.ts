import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'build',
    },
    // Bootstrap's internal SCSS is still using @import and some legacy color/math helpers.
    // To make the build process less noisy, related warnings are silenced.
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
            },
        },
    },
});