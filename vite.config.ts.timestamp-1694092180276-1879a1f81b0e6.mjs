// vite.config.ts
import { defineConfig } from "file:///home/cgm/projects/personal/bearbroidery/node_modules/.pnpm/vite@4.4.7_@types+node@18.17.0/node_modules/vite/dist/node/index.js";
import solid from "file:///home/cgm/projects/personal/bearbroidery/node_modules/.pnpm/vite-plugin-solid@2.7.0_solid-js@1.7.11_vite@4.4.7/node_modules/vite-plugin-solid/dist/esm/index.mjs";
import dts from "file:///home/cgm/projects/personal/bearbroidery/node_modules/.pnpm/vite-plugin-dts@3.3.1_typescript@5.0.2_vite@4.4.7/node_modules/vite-plugin-dts/dist/index.mjs";
import inspect from "file:///home/cgm/projects/personal/bearbroidery/node_modules/.pnpm/vite-plugin-inspect@0.7.14_rollup@3.26.3_vite@4.4.7/node_modules/vite-plugin-inspect/dist/index.mjs";
import solidDevtoolsPlugin from "file:///home/cgm/projects/personal/bearbroidery/node_modules/.pnpm/solid-devtools@0.27.4_solid-js@1.7.11_vite@4.4.7/node_modules/solid-devtools/dist/vite.js";
var vite_config_default = defineConfig(({ mode }) => {
  const plugins = [
    dts({
      insertTypesEntry: true
    }),
    inspect(),
    solid()
  ];
  if (mode === "development") {
    plugins.push(solidDevtoolsPlugin({ autoname: true }));
  }
  return {
    plugins,
    build: {
      emptyOutDir: false,
      lib: {
        entry: "./src/index.ts",
        formats: ["es"],
        fileName: (format) => `constructables.${format}.js`,
        name: "constructables"
      },
      minify: false,
      rollupOptions: {
        external: [
          "solid-js",
          "solid-js/web",
          "solid-js/store"
        ]
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9jZ20vcHJvamVjdHMvcGVyc29uYWwvYmVhcmJyb2lkZXJ5L3BhY2thZ2VzL2NvbnN0cnVjdGFibGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9jZ20vcHJvamVjdHMvcGVyc29uYWwvYmVhcmJyb2lkZXJ5L3BhY2thZ2VzL2NvbnN0cnVjdGFibGVzL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2NnbS9wcm9qZWN0cy9wZXJzb25hbC9iZWFyYnJvaWRlcnkvcGFja2FnZXMvY29uc3RydWN0YWJsZXMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIHR5cGUgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBzb2xpZCBmcm9tICd2aXRlLXBsdWdpbi1zb2xpZCdcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuaW1wb3J0IGluc3BlY3QgZnJvbSBcInZpdGUtcGx1Z2luLWluc3BlY3RcIjtcbmltcG9ydCBzb2xpZERldnRvb2xzUGx1Z2luIGZyb20gXCJzb2xpZC1kZXZ0b29scy92aXRlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoe21vZGV9KSAgPT4ge1xuICBjb25zdCBwbHVnaW5zID0gW1xuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgIH0pLFxuICAgIGluc3BlY3QoKSxcbiAgICBzb2xpZCgpLFxuICBdO1xuICBpZiAobW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiKSB7XG4gICAgcGx1Z2lucy5wdXNoKHNvbGlkRGV2dG9vbHNQbHVnaW4oeyBhdXRvbmFtZTogdHJ1ZSB9KSBhcyBQbHVnaW4pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zLFxuICAgIGJ1aWxkOiB7XG4gICAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgICBsaWI6IHtcbiAgICAgICAgZW50cnk6ICcuL3NyYy9pbmRleC50cycsXG4gICAgICAgIGZvcm1hdHM6IFsnZXMnXSxcbiAgICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBjb25zdHJ1Y3RhYmxlcy4ke2Zvcm1hdH0uanNgLFxuICAgICAgICBuYW1lOiAnY29uc3RydWN0YWJsZXMnLFxuICAgICAgfSxcbiAgICAgIG1pbmlmeTogZmFsc2UsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgICAgJ3NvbGlkLWpzJyxcbiAgICAgICAgICAnc29saWQtanMvd2ViJyxcbiAgICAgICAgICAnc29saWQtanMvc3RvcmUnLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIH0sXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtYLFNBQVMsb0JBQWlDO0FBQzVaLE9BQU8sV0FBVztBQUNsQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8seUJBQXlCO0FBRWhDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUMsS0FBSSxNQUFPO0FBQ3ZDLFFBQU0sVUFBVTtBQUFBLElBQ2QsSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsSUFDcEIsQ0FBQztBQUFBLElBQ0QsUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLEVBQ1I7QUFDQSxNQUFJLFNBQVMsZUFBZTtBQUMxQixZQUFRLEtBQUssb0JBQW9CLEVBQUUsVUFBVSxLQUFLLENBQUMsQ0FBVztBQUFBLEVBQ2hFO0FBRUEsU0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGFBQWE7QUFBQSxNQUNiLEtBQUs7QUFBQSxRQUNILE9BQU87QUFBQSxRQUNQLFNBQVMsQ0FBQyxJQUFJO0FBQUEsUUFDZCxVQUFVLENBQUMsV0FBVyxrQkFBa0IsTUFBTTtBQUFBLFFBQzlDLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixVQUFVO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
