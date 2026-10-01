/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        // Whitelist allowed hostnames to prevent DNS rebinding attacks while allowing proxied requests from Nginx
        allowedHosts: ['fmd.localhost', 'localhost', '127.0.0.1', 'host.docker.internal'],
        hmr: {
            // When proxied through Nginx on https://fmd.localhost, HMR connects over wss:// on port 443
            clientPort: process.env.VITE_CLIENT_PORT ? parseInt(process.env.VITE_CLIENT_PORT, 10) : 443,
        },
    },
    build: {
        outDir: 'build',
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
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
