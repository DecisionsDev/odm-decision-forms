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

/**
 * Set options
 *
 * @param {Store<any>} store
 * @param {Options} options
 */
export const setFormOptions = (store: Store<any>, options: Options) => {
	store.dispatch(setOptions(options));
};

/**
 * Create the store with the given swagger and execution request and return a Promise that will resolve with the newly
 * create store
 *
 * @param {WebRequest} swaggerRequest
 * @param {WebRequest} executeRequest
 * @param {Options} options
 * @returns {Promise<Store<any>>}
 */
export const init = (swaggerRequest: WebRequest,
										 executeRequest: WebRequest,
										 options: Options = defaultOptions) : Promise<Store<any>> => {
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
		return createStore<any>(combineReducers({
				requestSchema: emptyReducer,
				responseSchema: emptyReducer,
				executeRequest: emptyReducer,
				options: optionsReducer,
				executeResponse: responseReducer
			}),
			initialState,
			applyMiddleware(thunkMiddleware)
		);
	});
};

/**
 * Once the store is fully initialized, render the forms.
 * @param {Store<any>} store
 * @param {string} rootId
 */
export const renderForms = (rootId : string, store: Store<any>) => {
	ReactDOM.render(
		<Provider store={store}>
			<Forms/>
		</Provider>
		,
		document.getElementById(rootId)
	);
};

/**
 * Once the store is fully initialized, render the forms.
 * @param {Store<any>} store
 * @param {string} rootId
 * @param error
 */
export const renderError = (rootId : string, error) => {
	ReactDOM.render(<Error error={error}/>, document.getElementById(rootId));
};

/**
 * Init the store and render the forms all at once.
 *
 * @param {string} rootId
 * @param {WebRequest} swaggerRequest
 * @param {WebRequest} executeRequest
 * @param {Options} options
 * @returns {Promise<Store<any>>}
 */
export const initAndRender = (rootId : string,
															swaggerRequest: WebRequest,
															executeRequest: WebRequest,
															options: Options = defaultOptions) : Promise<Store<any> | null> => {
	return init(swaggerRequest, executeRequest, options)
		.then((store : Store<any>) => {
			renderForms(rootId, store);
			return store;
		})
		.catch(error => {
			renderError(rootId, error);
			return null;
		});
};