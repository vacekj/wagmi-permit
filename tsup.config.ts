import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	splitting: true,
	dts: true,
	sourcemap: true,
	clean: true,
	format: ["esm", "cjs"],
	outExtension({ format }) {
		return {
			js: `${format === "cjs" ? ".js" : ".mjs"}`,
			dts: `${format === "cjs" ? ".d.cts" : ".d.js"}`,
		};
	},
});
