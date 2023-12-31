import { defineConfig, type Plugin } from "vite";
import solid from 'vite-plugin-solid'
import dts from "vite-plugin-dts";
import inspect from "vite-plugin-inspect";
import solidDevtoolsPlugin from "solid-devtools/vite";

export default defineConfig(({mode})  => {
  const plugins = [
    dts({
      insertTypesEntry: true,
    }),
    inspect(),
    solid(),
  ];
  if (mode === "development") {
    plugins.push(solidDevtoolsPlugin({ autoname: true }) as Plugin);
  }

  return {
    plugins,
    build: {
      emptyOutDir: false,
      lib: {
        entry: './src/index.ts',
        formats: ['es'],
        fileName: (format) => `constructables.${format}.js`,
        name: 'constructables',
      },
      minify: false,
      rollupOptions: {
        external: [
          'solid-js',
          'solid-js/web',
          'solid-js/store',
        ]
      },
    },
  }
})
