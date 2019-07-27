import * as path from "path";
import nodeResolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
import { uglify } from "rollup-plugin-uglify";
import json from "rollup-plugin-json";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

const ensureArray = maybeArr =>
    Array.isArray(maybeArr) ? maybeArr : [maybeArr];

const createConfig = ({ input, output, external, env, min = false, ...props }) => ({
    input,
    experimentalCodeSplitting: typeof input !== "string",
    output: ensureArray(output).map(format =>
        Object.assign({}, format, {
            name: "Active-Record-Node",
            exports: "named"
        })
    ),
    external: ["util"],
    plugins: [
        nodeResolve({
            jsnext: true
        }),
        json({
            exclude: ["./node_modules/**"]
        }),
        commonjs({
            include: "./node_modules/**"
        }),
        babel({
            exclude: "./node_modules/**",
            runtimeHelpers: true,
            babelrcRoots: path.resolve(__dirname, "../*")
        }),
        env &&
            replace({
                "process.env.NODE_ENV": JSON.stringify(env)
            }),
        min &&
            uglify({
                compress: {
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true
                }
            })
    ].filter(Boolean),
    ...props
});


export default [
    createConfig({
        input: "src/index.js",
        output: {
            format: "esm",
            file: "dist/" + pkg.name + ".esm.js"
        }
    }),
    createConfig({
        input: "src/index.js",
        output: {
            format: "cjs",
            file: "dist/" + pkg.name + ".cjs.js"
        }
    })
];
