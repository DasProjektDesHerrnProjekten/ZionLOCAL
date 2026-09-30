// vite.config.ts
import { defineConfig } from "file:///C:/Users/Administrator/Pictures/Elyon-%20Exam/Elyon-Exam/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Pictures/Elyon-%20Exam/Elyon-Exam/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Administrator/Pictures/Elyon-%20Exam/Elyon-Exam/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Pictures\\Elyon- Exam\\Elyon-Exam";
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
    // Add this to suppress sourcemap warnings
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
      sourcemap: false,
      // Disable sourcemaps in production
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (warning.code === "SOURCEMAP_ERROR") {
            return;
          }
          if (warning.message.includes("Sourcemap is likely to be incorrect")) {
            return;
          }
          defaultHandler(warning);
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFBpY3R1cmVzXFxcXEVseW9uLSBFeGFtXFxcXEVseW9uLUV4YW1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFkbWluaXN0cmF0b3JcXFxcUGljdHVyZXNcXFxcRWx5b24tIEV4YW1cXFxcRWx5b24tRXhhbVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci9QaWN0dXJlcy9FbHlvbi0lMjBFeGFtL0VseW9uLUV4YW0vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICAvLyBGaWx0ZXIgb3V0IHNvdXJjZW1hcCB3YXJuaW5nc1xuICBjb25zdCBvcmlnaW5hbENvbnNvbGVXYXJuID0gY29uc29sZS53YXJuO1xuICBjb25zb2xlLndhcm4gPSAoLi4uYXJncykgPT4ge1xuICAgIGlmIChhcmdzLmxlbmd0aCA+IDAgJiYgXG4gICAgICAgIHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJyAmJiBcbiAgICAgICAgYXJnc1swXS5pbmNsdWRlcygnU291cmNlbWFwIGZvcicpICYmIFxuICAgICAgICBhcmdzWzBdLmluY2x1ZGVzKCdwb2ludHMgdG8gbWlzc2luZyBzb3VyY2UgZmlsZXMnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBvcmlnaW5hbENvbnNvbGVXYXJuLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiBcIjo6XCIsXG4gICAgICBwb3J0OiA4MDgwLFxuICAgICAgaG1yOiB7XG4gICAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgICAgICBwb3J0OiA4MDgwLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBBZGQgdGhpcyB0byBzdXBwcmVzcyBzb3VyY2VtYXAgd2FybmluZ3NcbiAgICBlc2J1aWxkOiB7XG4gICAgICBsb2dPdmVycmlkZTogeyAndGhpcy1pcy11bmRlZmluZWQtaW4tZXNtJzogJ3NpbGVudCcgfVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsIC8vIERpc2FibGUgc291cmNlbWFwcyBpbiBwcm9kdWN0aW9uXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG9ud2Fybih3YXJuaW5nLCBkZWZhdWx0SGFuZGxlcikge1xuICAgICAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdTT1VSQ0VNQVBfRVJST1InKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ1NvdXJjZW1hcCBpcyBsaWtlbHkgdG8gYmUgaW5jb3JyZWN0JykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdEhhbmRsZXIod2FybmluZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQWtXLFNBQVMsb0JBQW9CO0FBQy9YLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxzQkFBc0IsUUFBUTtBQUNwQyxVQUFRLE9BQU8sSUFBSSxTQUFTO0FBQzFCLFFBQUksS0FBSyxTQUFTLEtBQ2QsT0FBTyxLQUFLLENBQUMsTUFBTSxZQUNuQixLQUFLLENBQUMsRUFBRSxTQUFTLGVBQWUsS0FDaEMsS0FBSyxDQUFDLEVBQUUsU0FBUyxnQ0FBZ0MsR0FBRztBQUN0RDtBQUFBLElBQ0Y7QUFDQSx3QkFBb0IsTUFBTSxTQUFTLElBQUk7QUFBQSxFQUN6QztBQUVBLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxRQUNILFNBQVM7QUFBQSxRQUNULE1BQU07QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLElBQzlFLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsYUFBYSxFQUFFLDRCQUE0QixTQUFTO0FBQUEsSUFDdEQ7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQTtBQUFBLE1BQ1gsZUFBZTtBQUFBLFFBQ2IsT0FBTyxTQUFTLGdCQUFnQjtBQUM5QixjQUFJLFFBQVEsU0FBUyxtQkFBbUI7QUFDdEM7QUFBQSxVQUNGO0FBQ0EsY0FBSSxRQUFRLFFBQVEsU0FBUyxxQ0FBcUMsR0FBRztBQUNuRTtBQUFBLFVBQ0Y7QUFDQSx5QkFBZSxPQUFPO0FBQUEsUUFDeEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
