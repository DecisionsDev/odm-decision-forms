const program = require('commander');
const server = require('./server');
//const process = require('process');

program
	.version('0.0.1')
	.arguments('<rulesetPath>')
	.option('--port [port]', 'Server port. Default is 3000')
	.option('--url [url]', 'URL of the Decision Service Runtime to invoke. Default is http://localhost:8080/DecisionService')
	.option('--path [path]', 'Path of the ruleset to invoke. Eg: /myapp/2.0/myruleset/3.0')
	.option('--username [username]', 'User name to use to invoke the Decision Service')
	.option('--password [password]', 'Password to use to invoke the Deicsion Service')
	.option('--env [env]', 'One of production or development. Development will use the webpack server')
	.action(function(rulesetPath, options) {
		const port = options.port || 3000;
		const env = options.env || 'production';
		const url = options.url || 'http://localhost:8080/DecisionService';
		const username = options.username || 'resAdmin';
		const password = options.password || 'resAdmin';
		server.run({ url: url, path: rulesetPath, password: password, username: username }, { port: port, env: env});
	})
	.parse(process.argv);

