import { defineConfig } from "vite";
import { builtinModules } from "node:module";
import nodeResolve from "@rollup/plugin-node-resolve";
import fs from "fs";

const nodeModules = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)];

const externalModules = Object.keys(JSON.parse(fs.readFileSync("./package.json")).dependencies);

export default defineConfig(({ mode }) => {
    const isProduction = mode === "production";
    const tests = fs.readdirSync("./src").filter((i) => i.endsWith("-test.ts"));
    return {
        build: {
            sourcemap: true,
            outDir: "./dist",
            target: "esnext",
            minify: false,
            lib: {
                entry: {
                    index: "./src/index.ts",
                    ...(isProduction
                        ? {}
                        : Object.fromEntries(tests.map((i) => [i.slice(0, i.indexOf(".ts")), "./src/" + i]))),
                },
                fileName: (format, entryName) => `${entryName}.js`,
                formats: ["es"],
            },
            rollupOptions: {
                external: [...nodeModules, ...externalModules],
            },
        },
        plugins: [nodeResolve()],
    };
});
