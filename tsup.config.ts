import { defineConfig } from "tsup";
import { copyFileSync } from "node:fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  // React/React-DOM are peer deps — never bundle them.
  external: ["react", "react-dom", "react/jsx-runtime"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
  // Ship the themeable stylesheet alongside the JS so consumers can
  // `import "@vpnsin-labs/react-faq-chatbot/styles.css"`.
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/styles.css");
  },
});
