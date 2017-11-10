#!/usr/bin/env node

const program = require('commander');
const server = require('./server');
//const process = require('process');

program
	.version('0.0.1')
	.option('--port [port]', 'Server port. Default is 3000')
	.option('--decisionservice [decisionservice]', 'URL of the Decision Service Runtime to invoke. Default is http://localhost:8080/DecisionService')
	.option('--console [console]', 'URL of the RES console. Default is http://localhost:8080/res')
	.option('--path [path]', 'Path of the ruleset to invoke. Eg: /myapp/2.0/myruleset/3.0')
	.option('--username [username]', 'User name to use to invoke the Decision Service')
	.option('--password [password]', 'Password to use to invoke the Deicsion Service')
	.option('--env [env]', 'One of production or development. Development will use the webpack server')
	.parse(process.argv);

const port = program.port || 3000;
const env = program.env || 'production';
const decisionservice = program.decisionservice || program.url || 'http://localhost:8080/DecisionService';
const console = program.console || program.resUrl || 'http://localhost:8080/res';
const username = program.username || 'resAdmin';
const password = program.password || 'resAdmin';
server.run({ decisionservice: decisionservice, console: console, password: password, username: username }, { port: port, env: env});
