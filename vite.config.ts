import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

function saveResultsPlugin() {
  return {
    name: 'save-results-api',
    configureServer(server: any) {
      server.middlewares.use('/api/save-results', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const { saveExamResultToFile } = require('./scripts/save-result-helper.cjs');
              const payload = JSON.parse(body);
              const { baseFilename } = saveExamResultToFile(payload);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, file: baseFilename }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Filter out sourcemap warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        args[0].includes('Sourcemap for') && 
        args[0].includes('points to missing source files')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
        port: 8080,
      },
    },
    plugins: [react(), mode === "development" && componentTagger(), saveResultsPlugin()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      sourcemap: false, // Completely disable source maps in esbuild
    },
    build: {
      sourcemap: false, // Disable source maps in production
      minify: mode === 'production' ? 'esbuild' : false,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'clsx', '@radix-ui/react-slot'],
      esbuildOptions: {
        sourcemap: false, // Disable source maps in optimized deps
        target: 'es2020',
      },
    }
  };
});