'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var PATHS = {
	entryPoint: path.resolve(__dirname, 'src/client/index.tsx'),
	bundles: path.resolve(__dirname, '_bundles')
};


module.exports = {
	entry: {
		'odm-decision-forms-lib': [PATHS.entryPoint],
		'odm-decision-forms-lib.min': [PATHS.entryPoint]
	},
	output: {
		path: PATHS.bundles,
		filename: '[name].js',
		library: 'DecisionForms',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".json"]
	},
	// Activate source maps for the bundles in order to preserve the original
	// source when the user debugs the application
	devtool: 'source-map',
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		}),
		// Apply minification only on the second bundle by
		// using a RegEx on the name, which must end with `.min.js`
		// NB: Remember to activate sourceMaps in UglifyJsPlugin
		// since they are disabled by default!
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			sourceMap: true,
			include: /\.min\.js$/,
		})
	],
	module: {
		loaders: [
			{test: /\.json$/, loader: "json-loader"},
			{test: /\.styl$/, loader: "style-loader!css-loader!stylus-loader"},
			{
				test: /(\.css|\.scss)$/,
				loaders: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']
			},
			{
				test: /\.(ttf|eot|woff|woff2|svg)$/,
				loader: 'file-loader',
				options: {
					name: 'assets/fonts/[name].[ext]',
				}
			},
			{
				test: /\.less$/,
				include: [
					path.resolve(__dirname, 'node_modules/font-awesome-webpack/less')
				],
				use: [{
					loader: "style-loader" // creates style nodes from JS strings
				}, {
					loader: "css-loader" // translates CSS into CommonJS
				}, {
					loader: "less-loader" // compiles Less to CSS
				}]
			},
			{
				test: /\.(t|j)sx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'awesome-typescript-loader',
					query: {
						// we don't want any declaration file in the bundles
						// folder since it wouldn't be of any use ans the source
						// map already include everything for debugging
						declaration: false
					}
				}
			},
			{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
		]
	}
};
