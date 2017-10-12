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
import thunkMiddleware from 'redux-thunk';
var Promise = require('bluebird');
//import 'babel-polyfill';
//require('eventsource-polyfill');

Promise.all([axios.get(`/swagger.json`), axios.get(`/data.json`)]).then(values => {
	const swagger = values[0].data;
	document.title = swagger.info.title.substr(0, swagger.info.title.length - ' API'.length);
	const requestSchema = {
		$schema: "http://json-schema.org/draft-06/schema#",
		definitions: swagger.definitions,
		type: Type.TObject,
		properties: {
			request: {
				$ref: "#/definitions/Request"
			}
		}
	} as RootSchemaElement;
	normalizeSchema(requestSchema);
	const responseSchema = {
		$schema: "http://json-schema.org/draft-06/schema#",
		definitions: swagger.definitions,
		type: Type.TObject,
		properties: {
			response: {
				$ref: "#/definitions/Response"
			}
		}
	} as RootSchemaElement;
	normalizeSchema(requestSchema);
	normalizeSchema(responseSchema);
	const data = values[1].data;

	const initialState: State = {
		requestSchema: requestSchema,
		responseSchema: responseSchema,
		result: null,
		error: null
	};
	const store = createStore<State>(combineReducers({
			requestSchema: schemaReducer,
			responseSchema: schemaReducer,
			result: resultReducer,
			error: errorReducer
		}),
		initialState,
		applyMiddleware(thunkMiddleware)
	);

	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>
		,
		document.getElementById('root')
	);
}).catch(error => {
	console.log(error);
	ReactDOM.render(
		<div>
			<h3>Error reading Swagger file</h3>
			<div><b>Status:</b> {error.response.statusText.toUpperCase()}</div>
			<div><b>Message:</b> {error.response.data}</div>
		</div>
		,
		document.getElementById('root')
	);
});

const valuesPolyfill = function values (object) {
	return Object.keys(object).map(key => object[key]);
};


const normalizeSchema = (schema: RootSchemaElement): void => {
	if (schema.properties) {
		valuesPolyfill(schema.properties).filter(s => !(s as any).$ref).map(s => _normalizeSchema(s as SchemaElement));
	}
	if (schema.definitions) {
		delete (schema.definitions.Request as SchemaElement)!.properties!['__DecisionID__'];
		delete (schema.definitions.Response as SchemaElement)!.properties!['__DecisionID__'];
		valuesPolyfill(schema.definitions).filter(s => !(s as any).$ref).map(s => _normalizeSchema(s as SchemaElement));
	}
};

const _normalizeSchema = (schema: SchemaElement): void => {
	// The form generator does not seem to support this case...
	if (schema.type === Type.TNumber && schema.format === Format.Double) {
		delete schema.format;
	}
	if (schema.properties) {
		valuesPolyfill(schema.properties).filter(s => !(s as any).$ref).map(s => _normalizeSchema(s as SchemaElement));
	}
};