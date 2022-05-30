const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TSConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
	entry: path.resolve(__dirname, "./src/index.tsx"),
	mode: "development",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader"
			},
			{
				test: /\.s?css$/,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader"
				]
			},
			{
				test: /\.md$/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: [ "@babel/preset-react" ]
						}
					},
					"markdown-to-react-loader"
				]
			},
			{
				test: /\.(ttf|woff2?)$/,
				use: "file-loader"
			},
		]
	},
	resolve: {
		extensions: [ ".ts", ".js", ".tsx", ".jsx" ],
		plugins: [
			new TSConfigPathsPlugin({
				configFile: path.join(__dirname, "tsconfig.json"),
			}),
		],
	},
	plugins: [
		new HtmlPlugin({
			template: path.resolve(__dirname, "index.html"),
			title: "Auto Automata",
			base: "/auto-automata/"
		}),
		new CopyPlugin({
			patterns: [
				{ from: path.resolve(__dirname, "static"), to: "./static/" }
			]
		})
	],
	output: {
		filename: "index.js",
		path: path.resolve(__dirname, "dist")
	},
	devServer: {
		contentBase: path.resolve(__dirname, "dist"),
		port: 9090,
		host: "0.0.0.0"
	}
};
