import * as React from "react";
import * as ReactDOM from 'react-dom';
var PropTypes = require('prop-types'); // ES5 with npm

var ES6Promise = require("es6-promise");
ES6Promise.polyfill();
var axios = require("axios");
import {
	Format, RootSchemaElement, SchemaElement, SchemaElementRef, SchemaPatternProperty, SchemaProperties, schemaVersion,
	Type
} from "./schema";
import {applyMiddleware, combineReducers, createStore} from "redux";
import {ResState, State} from "./state";
import {errorReducer, requestReducer, resReducer, resultReducer, schemaReducer} from "./reducers";
import {Provider} from "react-redux";
import App from './components/app';
import Error from './components/error';
const styles = require('./main.scss');

var Promise = require('bluebird');
import {loadRulesetPaths, loadSwagger} from './resapi';
//import 'babel-polyfill';
import thunkMiddleware from 'redux-thunk';
import {ConnectedRouter, routerReducer, routerMiddleware, RouterState} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

loadRulesetPaths()
	.then((resState: ResState) => {
		if (history && (history as any).location && ((history as any).location as any).pathname) {
			const rulesetPath = ((history as any).location as any).pathname!;
			if (rulesetPath.indexOf('/ruleapp') == 0) {
				return loadSwagger(rulesetPath.substr('/ruleapp'.length))
					.then(({request, response}) => {
						const initialState: State = {
							requestSchema: request,
							responseSchema: response,
							executeRequest: {
								url: '/execute' + rulesetPath.substr('/ruleapp'.length),
								transformPayload: payload => ({ request: payload }),
								transformResult: result => result
							},
							result: null,
							res: resState,
							error: null,
							router: {}
						};
						const store = createStore<State>(combineReducers({
								requestSchema: schemaReducer,
								responseSchema: schemaReducer,
								executeRequest: requestReducer,
								result: resultReducer,
								res: resReducer,
								error: errorReducer,
								router: routerReducer
							}),
							initialState,
							applyMiddleware(historyMiddleware, thunkMiddleware)
						);
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
			}
		}
		const initialState: State = {
			requestSchema: null,
			responseSchema: null,
			executeRequest: null,
			result: null,
			res: resState,
			error: null,
			router: {}
		};
		const store = createStore<State>(combineReducers({
				requestSchema: schemaReducer,
				responseSchema: schemaReducer,
				executeRequest: requestReducer,
				result: resultReducer,
				error: errorReducer,
				res: resReducer,
				router: routerReducer
			}),
			initialState,
			applyMiddleware(historyMiddleware, thunkMiddleware)
		);
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
