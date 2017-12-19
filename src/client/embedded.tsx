import * as React from "react";
import * as ReactDOM from 'react-dom'

import Forms from './components/forms';
import Error from './components/error';

import {applyMiddleware, combineReducers, createStore} from "redux";
import {Provider} from "react-redux";
import thunkMiddleware from 'redux-thunk';
import {ConnectedRouter, routerReducer, routerMiddleware, RouterState} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

const styles = require('./main.scss');

import axios from "axios";
import { readSwagger } from "./resapi";
import { requestReducer, resReducer, responseReducer, schemaReducer} from "./reducers";
import {decisionStatusNotRun, WebRequest} from "./state";

const renderForms = (rootId : string, swaggerRequest: WebRequest, executeRequest: WebRequest) => {
	let identity = a => a;
	let transformResult = swaggerRequest.transformResult || identity;
	let headers = swaggerRequest.headers || {};
	axios.get(swaggerRequest.url, { headers }).then(({data}) => {
		const swagger = transformResult(data);
		let res = readSwagger(swagger);
		const initialState = {
			requestSchema: res.request,
			responseSchema: res.response,
			executeRequest: executeRequest,
			executeResponse: { status : decisionStatusNotRun },
			res: {ruleapps: {}},
			router: {}
		};
		const store = createStore<any>(combineReducers({
				requestSchema: schemaReducer,
				responseSchema: schemaReducer,
				executeRequest: requestReducer,
				executeResponse: responseReducer,
				res: resReducer,
				router: routerReducer
			}),
			initialState,
			applyMiddleware(historyMiddleware, thunkMiddleware)
		);
		ReactDOM.render(
			<Provider store={store}>
				<Forms/>
			</Provider>
			,
			document.getElementById(rootId)
		);
	}).catch(error => {
		ReactDOM.render(<Error error={error}/>, document.getElementById(rootId));
	});
};

export default renderForms;
