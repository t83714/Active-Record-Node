const path = require("path");
const webpack = require("webpack");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const PROD = JSON.parse(process.env.PROD_ENV || "0");
const plugins = [];
if (PROD) {
    plugins.push(new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify("production"),
        },
    }));
    plugins.push(new UglifyJSPlugin({
        uglifyOptions: {
            compress: false,
            ecma: 6
        },
        sourceMap: true
    }));
}
plugins.push(new webpack.NoEmitOnErrorsPlugin());

module.exports = {
    target: "node",
    devtool: "sourcemap",
    plugins,
    entry: {
        index: [
            "./src/index.js",
        ],
    },
    output: {
        path: path.resolve(__dirname, "lib"),
        libraryTarget: "commonjs",
        filename: PROD ? "index.bundle.min.js" : "index.bundle.js",
    },
    externals:{
        lodash: {
            commonjs2: "lodash",
            commonjs: "lodash",
            amd: "lodash",
        },
    },
};