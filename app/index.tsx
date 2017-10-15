import * as React from "react";
import * as ReactDOM from 'react-dom'

var ES6Promise = require("es6-promise");
ES6Promise.polyfill();
var axios = require("axios");
import {
	Format, RootSchemaElement, SchemaElement, SchemaElementRef, SchemaPatternProperty, SchemaProperties, schemaVersion,
	Type
} from "./schema";
import {applyMiddleware, combineReducers, createStore} from "redux";
import {State} from "./state";
import {errorReducer, resultReducer, schemaReducer} from "./reducers";
import {Provider} from "react-redux";
import App from './components/app';
import Error from './components/error';

var Promise = require('bluebird');
import loadSwagger from './swagger';
//import 'babel-polyfill';
//require('eventsource-polyfill');
import thunkMiddleware from 'redux-thunk';
import {ConnectedRouter, routerReducer, routerMiddleware, RouterState} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

if (history && (history as any).location && ((history as any).location as any).pathname) {
	const rulesetPath = ((history as any).location as any).pathname!;
//const rulesetPath = '/miniloanv2/1.0/miniloan_rulesRuleset/1.0';

	loadSwagger(rulesetPath.substr('/ruleapp'.length))
		.then(({request, response}) => {
			const initialState: State = {
				requestSchema: request,
				responseSchema: response,
				result: null,
				error: null,
				router: {}
			};
			const store = createStore<State>(combineReducers({
					requestSchema: schemaReducer,
					responseSchema: schemaReducer,
					result: resultReducer,
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
		})
		.catch(error => {
			console.log(error);
			ReactDOM.render(<Error error={error}/>, document.getElementById('root'));
		});
} else {
	ReactDOM.render(<div>No data yet</div>, document.getElementById('root'));

}
