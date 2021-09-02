import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import esmImportToUrl from "rollup-plugin-esm-import-to-url";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "browser/index.js",
        format: "es",
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      esmImportToUrl({
        imports: {
          quill: "https://unpkg.com/quill@2.0.0-dev.4/dist/quill.js",
          tslib: "https://unpkg.com/tslib@2/tslib.es6.js",
          "long-press-event":
            "https://unpkg.com/long-press-event@2/dist/long-press-event.min.js",
        },
      }),
      resolve({ browser: true }),
      commonjs({
        transformMixedEsModules: true,
      }),
      typescript({
        tsconfig: "./tsconfig.esm.json",
      }),
    ],
  },
];
