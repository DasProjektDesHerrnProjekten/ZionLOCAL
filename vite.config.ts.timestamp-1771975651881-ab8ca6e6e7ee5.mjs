// vite.config.ts
import { defineConfig } from "file:///C:/Users/Administrator/Downloads/ElyonMainV2-master/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Downloads/ElyonMainV2-master/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Administrator/Downloads/ElyonMainV2-master/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Downloads\\ElyonMainV2-master";
var vite_config_default = defineConfig(({ mode }) => {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args.length > 0 && typeof args[0] === "string" && args[0].includes("Sourcemap for") && args[0].includes("points to missing source files")) {
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
        port: 8080
      }
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      sourcemap: false
      // Completely disable source maps in esbuild
    },
    build: {
      sourcemap: false,
      // Disable source maps in production
      minify: mode === "production" ? "esbuild" : false
    },
    optimizeDeps: {
      include: ["react", "react-dom", "clsx", "@radix-ui/react-slot"],
      esbuildOptions: {
        sourcemap: false,
        // Disable source maps in optimized deps
        target: "es2020"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXERvd25sb2Fkc1xcXFxFbHlvbk1haW5WMi1tYXN0ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFkbWluaXN0cmF0b3JcXFxcRG93bmxvYWRzXFxcXEVseW9uTWFpblYyLW1hc3RlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci9Eb3dubG9hZHMvRWx5b25NYWluVjItbWFzdGVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gRmlsdGVyIG91dCBzb3VyY2VtYXAgd2FybmluZ3NcbiAgY29uc3Qgb3JpZ2luYWxDb25zb2xlV2FybiA9IGNvbnNvbGUud2FybjtcbiAgY29uc29sZS53YXJuID0gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwICYmIFxuICAgICAgICB0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgJiYgXG4gICAgICAgIGFyZ3NbMF0uaW5jbHVkZXMoJ1NvdXJjZW1hcCBmb3InKSAmJiBcbiAgICAgICAgYXJnc1swXS5pbmNsdWRlcygncG9pbnRzIHRvIG1pc3Npbmcgc291cmNlIGZpbGVzJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgb3JpZ2luYWxDb25zb2xlV2Fybi5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICAgIGhtcjoge1xuICAgICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICAgICAgcG9ydDogODA4MCxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgZXNidWlsZDoge1xuICAgICAgbG9nT3ZlcnJpZGU6IHsgJ3RoaXMtaXMtdW5kZWZpbmVkLWluLWVzbSc6ICdzaWxlbnQnIH0sXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBDb21wbGV0ZWx5IGRpc2FibGUgc291cmNlIG1hcHMgaW4gZXNidWlsZFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsIC8vIERpc2FibGUgc291cmNlIG1hcHMgaW4gcHJvZHVjdGlvblxuICAgICAgbWluaWZ5OiBtb2RlID09PSAncHJvZHVjdGlvbicgPyAnZXNidWlsZCcgOiBmYWxzZSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAnY2xzeCcsICdAcmFkaXgtdWkvcmVhY3Qtc2xvdCddLFxuICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgc291cmNlbWFwOiBmYWxzZSwgLy8gRGlzYWJsZSBzb3VyY2UgbWFwcyBpbiBvcHRpbWl6ZWQgZGVwc1xuICAgICAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgICAgfSxcbiAgICB9XG4gIH07XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXFWLFNBQVMsb0JBQW9CO0FBQ2xYLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxzQkFBc0IsUUFBUTtBQUNwQyxVQUFRLE9BQU8sSUFBSSxTQUFTO0FBQzFCLFFBQUksS0FBSyxTQUFTLEtBQ2QsT0FBTyxLQUFLLENBQUMsTUFBTSxZQUNuQixLQUFLLENBQUMsRUFBRSxTQUFTLGVBQWUsS0FDaEMsS0FBSyxDQUFDLEVBQUUsU0FBUyxnQ0FBZ0MsR0FBRztBQUN0RDtBQUFBLElBQ0Y7QUFDQSx3QkFBb0IsTUFBTSxTQUFTLElBQUk7QUFBQSxFQUN6QztBQUVBLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxRQUNILFNBQVM7QUFBQSxRQUNULE1BQU07QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLElBQzlFLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLGFBQWEsRUFBRSw0QkFBNEIsU0FBUztBQUFBLE1BQ3BELFdBQVc7QUFBQTtBQUFBLElBQ2I7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQTtBQUFBLE1BQ1gsUUFBUSxTQUFTLGVBQWUsWUFBWTtBQUFBLElBQzlDO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLFFBQVEsc0JBQXNCO0FBQUEsTUFDOUQsZ0JBQWdCO0FBQUEsUUFDZCxXQUFXO0FBQUE7QUFBQSxRQUNYLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
