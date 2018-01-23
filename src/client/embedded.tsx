import * as React from "react";
import * as ReactDOM from 'react-dom'

import Forms from './components/forms';
import StandaloneForm from './components/standaloneForm';
import Error from './components/error';

import {applyMiddleware, Store} from "redux";
import {Provider} from "react-redux";
import {ConnectedRouter, routerMiddleware, RouterState} from 'react-router-redux'

const styles = require('./main.scss');

import axios from "axios";
import {readSwagger} from "./resapi";
import {
	defaultOptions, Options, WebRequest, PageState, Page, StandaloneFormState, FormsState, FormController,
	FormHandlers
} from "./state";
import {setOptions as setOptionsAction} from "./actions";
import {NormalizedRequestAndResponse, RootSchemaElement} from "./schema";
import {createFormsStore, createStandaloneFormStore} from "./stores";
import thunkMiddleware from 'redux-thunk';

/**
 * @deprecated
 */
export const setFormOptions = (store: Store<any>, options: Options) => {
	store.dispatch(setOptionsAction(options));
};

/**
 * @deprecated
 */
export const init = (swaggerRequest: WebRequest,
										 executeRequest: WebRequest,
										 options: Options = defaultOptions): Promise<Store<FormsState>> => {
	return inout(swaggerRequest, executeRequest, options).then(o => o.store);
};

/**
 * @deprecated
 */
export const renderForms = (rootId: string, store: Store<FormsState>) => {
	ReactDOM.render(
		<Provider store={store}>
			<Forms/>
		</Provider>
		,
		document.getElementById(rootId)
	);
};

export class FormBasedComponent<T extends FormsState | StandaloneFormState> {
	store: Store<T>;
	constructor(store: Store<T>) {
		this.store = store;
	}
	setOptions(options: Options) {
		this.store.dispatch(setOptionsAction(options));
	}
}

export class InOutFormsComponent extends FormBasedComponent<FormsState> {

	render(rootId: string) {
		ReactDOM.render(
		<Provider store={this.store}>
		<Forms/>
		</Provider>,
		document.getElementById(rootId)
		);
	}

}

export class StandaloneFormComponent extends FormBasedComponent<StandaloneFormState> {
	constructor(store: Store<StandaloneFormState>) {
		super(store);
	}
	submit() {
		this.store.getState().controller.submit();
	}
	render(rootId: string) {
		ReactDOM.render(
		<Provider store={this.store}>
		<StandaloneForm/>
		</Provider>
		,
		document.getElementById(rootId)
		);
	}
}

/**
 * Create the store with the given swagger and execution request and return a Promise that will resolve with the newly
 * created store
 *
 * @param {WebRequest} swaggerRequest
 * @param {WebRequest} executeRequest
 * @param {Options} options
 * @returns {Promise<Store<any>>}
 */
export const inout = (swaggerRequest: WebRequest,
											executeRequest: WebRequest,
											options: Options = defaultOptions) : Promise<InOutFormsComponent> => {
	const identity = a => a;
	const transformResult = swaggerRequest.transformResult || identity;
	const headers = swaggerRequest.headers || {};
	return axios.get(swaggerRequest.url, {headers}).then(({data}) => {
		const swagger = transformResult(data);
		const res: NormalizedRequestAndResponse = readSwagger(swagger, options);
		const store = createFormsStore(res, executeRequest, options, applyMiddleware(thunkMiddleware));
		return new InOutFormsComponent(store);
	});
};

/**
 * Create a standalone form from the given schema and data
 *
 * @param {RootSchemaElement} schema
 * @param {Object} data
 * @param {FormHandlers} handlers
 * @param {Options} options
 * @returns {StandaloneFormComponent}
 */
export const standalone = (schema: RootSchemaElement,
													 data: object,
													 handlers: FormHandlers,
													 options: Options = defaultOptions) => {
	const controller = new FormController(handlers);
	const store = createStandaloneFormStore(schema, data, controller, options, applyMiddleware(thunkMiddleware));
	return new StandaloneFormComponent(store);
};

/**
 * Once the store is fully initialized, render the forms.
 * @param {Store<any>} store
 * @param {string} rootId
 * @param error
 */
export const renderError = (rootId: string, error) => {
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
export const initAndRender = (rootId: string,
															swaggerRequest: WebRequest,
															executeRequest: WebRequest,
															options: Options = defaultOptions): Promise<Store<any> | null> => {
	return init(swaggerRequest, executeRequest, options)
		.then((store: Store<any>) => {
			renderForms(rootId, store);
			return store;
		})
		.catch(error => {
			renderError(rootId, error);
			return null;
		});
};