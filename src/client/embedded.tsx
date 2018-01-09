import * as React from "react";
import * as ReactDOM from 'react-dom'

import Forms from './components/forms';
import Error from './components/error';

import {applyMiddleware, combineReducers, createStore, Store} from "redux";
import {Provider} from "react-redux";
import thunkMiddleware from 'redux-thunk';
import {ConnectedRouter, routerMiddleware, RouterState} from 'react-router-redux'

const styles = require('./main.scss');

import axios from "axios";
import { readSwagger } from "./resapi";
import {emptyReducer, optionsReducer, responseReducer} from "./reducers";
import {DecisionStatus, defaultOptions, FormsState, Options, WebRequest} from "./state";
import {setOptions} from "./actions";

export const setFormOptions = (store: Store<any>, options: Options) => {
	store.dispatch(setOptions(options));
};

export const init = (rootId : string, swaggerRequest: WebRequest, executeRequest: WebRequest, options: Options = defaultOptions) => {
	let identity = a => a;
	let transformResult = swaggerRequest.transformResult || identity;
	let headers = swaggerRequest.headers || {};
	return axios.get(swaggerRequest.url, { headers }).then(({data}) => {
		const swagger = transformResult(data);
		let res = readSwagger(swagger, options);
		const initialState : FormsState = {
			requestSchema: res.request,
			responseSchema: res.response,
			executeRequest: executeRequest,
			executeResponse: { status : DecisionStatus.NotRun },
			options: options
		};
		const store = createStore<any>(combineReducers({
				requestSchema: emptyReducer,
				responseSchema: emptyReducer,
				executeRequest: emptyReducer,
				options: optionsReducer,
				executeResponse: responseReducer
			}),
			initialState,
			applyMiddleware(thunkMiddleware)
		);
		ReactDOM.render(
			<Provider store={store}>
				<Forms/>
			</Provider>
			,
			document.getElementById(rootId)
		);
		return store;
	}).catch(error => {
		ReactDOM.render(<Error error={error}/>, document.getElementById(rootId));
	});
};
