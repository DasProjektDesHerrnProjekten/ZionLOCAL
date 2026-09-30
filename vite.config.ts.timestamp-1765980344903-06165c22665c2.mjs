// vite.config.ts
import { defineConfig } from "file:///C:/Users/Administrator/Pictures/ElyonQuiz-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Pictures/ElyonQuiz-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Administrator/Pictures/ElyonQuiz-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Pictures\\ElyonQuiz-main";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFBpY3R1cmVzXFxcXEVseW9uUXVpei1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFBpY3R1cmVzXFxcXEVseW9uUXVpei1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yL1BpY3R1cmVzL0VseW9uUXVpei1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gRmlsdGVyIG91dCBzb3VyY2VtYXAgd2FybmluZ3NcbiAgY29uc3Qgb3JpZ2luYWxDb25zb2xlV2FybiA9IGNvbnNvbGUud2FybjtcbiAgY29uc29sZS53YXJuID0gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwICYmIFxuICAgICAgICB0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgJiYgXG4gICAgICAgIGFyZ3NbMF0uaW5jbHVkZXMoJ1NvdXJjZW1hcCBmb3InKSAmJiBcbiAgICAgICAgYXJnc1swXS5pbmNsdWRlcygncG9pbnRzIHRvIG1pc3Npbmcgc291cmNlIGZpbGVzJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgb3JpZ2luYWxDb25zb2xlV2Fybi5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICAgIGhtcjoge1xuICAgICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICAgICAgcG9ydDogODA4MCxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gQWRkIHRoaXMgdG8gc3VwcHJlc3Mgc291cmNlbWFwIHdhcm5pbmdzXG4gICAgZXNidWlsZDoge1xuICAgICAgbG9nT3ZlcnJpZGU6IHsgJ3RoaXMtaXMtdW5kZWZpbmVkLWluLWVzbSc6ICdzaWxlbnQnIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBEaXNhYmxlIHNvdXJjZW1hcHMgaW4gcHJvZHVjdGlvblxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvbndhcm4od2FybmluZywgZGVmYXVsdEhhbmRsZXIpIHtcbiAgICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSAnU09VUkNFTUFQX0VSUk9SJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAod2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdTb3VyY2VtYXAgaXMgbGlrZWx5IHRvIGJlIGluY29ycmVjdCcpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHRIYW5kbGVyKHdhcm5pbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVSxTQUFTLG9CQUFvQjtBQUNuVyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRXhDLFFBQU0sc0JBQXNCLFFBQVE7QUFDcEMsVUFBUSxPQUFPLElBQUksU0FBUztBQUMxQixRQUFJLEtBQUssU0FBUyxLQUNkLE9BQU8sS0FBSyxDQUFDLE1BQU0sWUFDbkIsS0FBSyxDQUFDLEVBQUUsU0FBUyxlQUFlLEtBQ2hDLEtBQUssQ0FBQyxFQUFFLFNBQVMsZ0NBQWdDLEdBQUc7QUFDdEQ7QUFBQSxJQUNGO0FBQ0Esd0JBQW9CLE1BQU0sU0FBUyxJQUFJO0FBQUEsRUFDekM7QUFFQSxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsUUFDSCxTQUFTO0FBQUEsUUFDVCxNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUM5RSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLFNBQVM7QUFBQSxNQUNQLGFBQWEsRUFBRSw0QkFBNEIsU0FBUztBQUFBLElBQ3REO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUE7QUFBQSxNQUNYLGVBQWU7QUFBQSxRQUNiLE9BQU8sU0FBUyxnQkFBZ0I7QUFDOUIsY0FBSSxRQUFRLFNBQVMsbUJBQW1CO0FBQ3RDO0FBQUEsVUFDRjtBQUNBLGNBQUksUUFBUSxRQUFRLFNBQVMscUNBQXFDLEdBQUc7QUFDbkU7QUFBQSxVQUNGO0FBQ0EseUJBQWUsT0FBTztBQUFBLFFBQ3hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
