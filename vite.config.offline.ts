import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
        port: 8080,
      },
    },
    plugins: [
      react(),
      {
        name: 'fix-html-paths',
        transformIndexHtml: {
          enforce: 'post',
          transform: (html) => {
            // Replace absolute paths with relative paths
            return html
              .replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"')
              .replace(/src="\/assets\//g, 'src="./assets/')
              .replace(/href="\/assets\//g, 'href="./assets/')
              // Remove external URLs from meta tags
              .replace(/<meta property="og:url"[^>]*>/g, '')
              .replace(/<meta property="og:image"[^>]*>/g, '')
              .replace(/<meta name="twitter:url"[^>]*>/g, '')
              .replace(/<meta name="twitter:image"[^>]*>/g, '');
          },
        },
      },
      {
        name: 'copy-preconfigured-db',
        closeBundle: () => {
          // Copy pre-configured database if it exists
          const dbPath = path.resolve(__dirname, 'exam-offline.db');
          const destPath = path.resolve(__dirname, 'dist-offline/exam-offline.db');
          if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, destPath);
            console.log('✅ Copied pre-configured database to dist-offline');
          }
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      sourcemap: false,
      target: 'es2020',
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
      outDir: 'dist-offline',
      assetsDir: 'assets',
      base: './',
      target: 'es2015',
      rollupOptions: {
        output: {
          format: 'iife',
          manualChunks: undefined,
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: (assetInfo) => {
            // Keep WASM files in root, not in assets folder
            if (assetInfo.name?.endsWith('.wasm')) {
              return '[name][extname]';
            }
            return 'assets/[name].[ext]';
          },
        },
      },
      // Ensure WASM files are copied
      assetsInlineLimit: 0,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'clsx', '@radix-ui/react-slot'],
      esbuildOptions: {
        sourcemap: false,
        target: 'es2020',
      },
    },
    // Offline-specific settings
    define: {
      'import.meta.env.VITE_OFFLINE_MODE': JSON.stringify('true'),
    },
    // Ensure public assets are copied
    publicDir: 'public',
  };
});