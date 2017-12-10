'use strict';

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	entry: {
		form: [
			path.join(__dirname, 'src/client/embedded.tsx')
		]
	},
	target: "node",
	output: {
		path: path.join(__dirname, '/lib/'),
		filename: '[name].js',
		libraryTarget: 'umd',
		umdNamedDefine: true,
		library: 'FormExec'
	},
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".json"]
	},
	plugins: [
			new ExtractTextPlugin("styles.css"),
		new webpack.optimize.UglifyJsPlugin({
			compressor: {
				warnings: false,
				screw_ie8: true
			}
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		})
	],
	module: {
		rules: [
			{
				test: /\.(ttf|eot|woff|woff2|svg)$/,
				loader: 'file-loader',
				options: {
					name: 'assets/fonts/[name].[ext]',
				}
			},
			{ test: /\.(t|j)sx?$/, use: { loader: 'awesome-typescript-loader' } },
			{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: { loader: 'css-loader', options: { minimize: true } }
				})
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: ExtractTextPlugin.extract({
					use: [{ loader: 'css-loader', options: { minimize: true } }, { loader: 'sass-loader', options: { minimize: true }}]
				})
			}
		]
	},
	node: {
		console: true,
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	}

};
