'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	entry: {
		app: [
			'event-source-polyfill',
			"babel-polyfill",
			path.join(__dirname, 'src/client/index.tsx')
		]
	},
	output: {
		path: path.join(__dirname, '/dist/'),
		filename: '[name]-[hash].min.js',
		publicPath: '/'
	},
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".json"]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/client/index.tpl.html',
			inject: 'body',
			filename: 'index.html'
		}),
		new ExtractTextPlugin('[name]-[hash].min.css'),
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
			// {
			// 	test: /(\.css|\.scss)$/,
			// 	loaders: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']
			// },
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
	}
};
