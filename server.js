/* eslint no-console: 0 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

function sendErrorMessage(message, error, res) {
	if (error.response && error.response.data && error.response.data.message) {
		message = message + ": " + error.response.data.message;
	} else if (error.message) {
		message = message + ": " + error.message;
	}
	if (error.response && error.response.status) {
		res.status(error.response.status);
	} else {
		res.status(500);
	}
	res.send(message);
}


/**
 * Run an Express server that serves the auto-generated forms as the Rule Service execution.
 *
 * @returns {*} The express app
 */
module.exports.run = function (config, options) {
	const port = options.port || 3000;
	const isDeveloping = options.env === 'development';
	const resConfig = {
		auth: {
			username: config.username,
			password: config.password
		}
	};
	const app = express();
	app.use(bodyParser.json());
	app.use(cors());
	app.options('/swagger/*', cors());
	app.get('/swagger/*', function (req, res) {
		const rulesetpath = req.params[0];
		const swaggerUrl = config.url + '/rest/v1/' + rulesetpath + '/OPENAPI?format=JSON';
		axios.get(swaggerUrl, resConfig)
			.then(function (resp) {
				res.send(resp.data);
			})
			.catch(function (error) {
				sendErrorMessage('Error reading swagger', error, res);
			});
	});
	app.get('/rulesets', function (req, res) {
		const rulesetsUrl = config.resUrl + '/api/v1/rulesets?accept=application%2Fjson';
		axios.get(rulesetsUrl, resConfig)
			.then(function (resp) {
				res.send(resp.data);
			})
			.catch(function (error) {
				sendErrorMessage('Error reading swagger', error, res);
			});
	});
	app.post('/execute/*', function (req, res) {
		const rulesetpath = req.params[0];
		var payload = req.body.request;
		const resUrl = config.url + '/rest/' + rulesetpath;
		axios.post(resUrl, payload, resConfig)
			.then(function (response) {
				res.send(response.data);
			})
			.catch(function(error) {
				sendErrorMessage('Error executing Decision Service', error, res);
			});
	});
	if (isDeveloping) {
		// Include webpack only if needed, so that it is not loaded from modules than only need the production version
		var withWebpack = require('./with-webpack');
		withWebpack(app);
	} else {
		app.use(express.static(__dirname + '/dist'));
		app.get('*', function response(req, res) {
			res.sendFile(path.join(__dirname, 'dist/index.html'));
		});
	}
	app.listen(port, '0.0.0.0', function onStart(err) {
		if (err) {
			console.log(err);
		}
		console.info('==> 🌎 CMS Server Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
	});
};
