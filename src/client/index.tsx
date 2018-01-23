import * as React from "react";
import * as ReactDOM from 'react-dom';
import {applyMiddleware, combineReducers, createStore} from "redux";
import {Provider} from "react-redux";
import App from "./components/app";
import Error from "./components/error";

const styles = require('./main.scss');

import thunkMiddleware from 'redux-thunk';
import {ConnectedRouter, routerMiddleware} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';
import {loadRulesetPaths, loadSwagger} from "./resapi";
import { defaultOptions, ResState} from "./state";
import {createFormsStore, createHomeStore} from "./stores";
import {standalone} from "./embedded";

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

loadRulesetPaths()
	.then((resState: ResState) => {
		if (history && (history as any).location && ((history as any).location as any).pathname) {
			const rulesetPath = ((history as any).location as any).pathname!;
			if (rulesetPath.indexOf('/ruleapp') == 0) {
				return loadSwagger(rulesetPath.substr('/ruleapp'.length), defaultOptions)
					.then(({request, response}) => {
						const store = createFormsStore({
							request: request, response: response
						}, {
							url: '/execute' + rulesetPath.substr('/ruleapp'.length),
							transformPayload: payload => ({ request: payload }),
							transformResult: result => result
						}, defaultOptions, applyMiddleware(historyMiddleware, thunkMiddleware));
						ReactDOM.render(
							<Provider store={store}>
								<ConnectedRouter history={history}>
									<App/>
								</ConnectedRouter>
							</Provider>
							,
							document.getElementById('root')
						);
					});
			} else if (rulesetPath.indexOf('/standalone') == 0) { // Test of the standalone mode
				return loadSwagger(rulesetPath.substr('/standalone'.length), defaultOptions)
					.then(({request, response}) => {
						standalone(request, {}, {}, defaultOptions).render('root');
					});
			}
		}
		const store = createHomeStore(resState, applyMiddleware(historyMiddleware, thunkMiddleware));
		ReactDOM.render(
			<Provider store={store}>
				<ConnectedRouter history={history}>
					<App/>
				</ConnectedRouter>
			</Provider>
			,
			document.getElementById('root')
		);
	})
	.catch(err => {
		ReactDOM.render(<Error error={err}/>, document.getElementById('root'));
	});
