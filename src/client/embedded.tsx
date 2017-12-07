import * as React from "react";
import * as ReactDOM from 'react-dom'

import Forms from './components/forms';

import {applyMiddleware, combineReducers, createStore} from "redux";
import {Provider} from "react-redux";
import thunkMiddleware from 'redux-thunk';
import {ConnectedRouter, routerReducer, routerMiddleware, RouterState} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

const styles = require('./main.scss');

// const projectId = "354b76c4ced84ee1b81f7cbb425068ec";
// const apiKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOlsiZnVsbCJdLCJ1c2VySWQiOiIwYTI5YjM2YzMyOTQ0YzEzYmVmYTBlYTQ1MTQ5MzJjOCIsImp0aSI6IjYyMGJkMWQ3ZTZmMzRiNWE5ZjAyYTViZWE4YzVkZDk0IiwidXNlcm5hbWUiOiJhbnRvaW5lLm1lbGtpQGlibS5jb20ifQ.XnUeVNOWZRKDRAGLVeFBd4EAG51TbJIc05F2DY41VTo";

import axios from "axios";
import { readSwagger } from "./resapi";
import {errorReducer, requestReducer, resReducer, resultReducer, schemaReducer} from "./reducers";

const renderForms = (rootId, swaggerUri, executeRequest) => {
	// const swaggerUri = `${baseUrl}/execution/${projectId}/api/v1?apiKey=${token}`;
	// const executeUri = `${baseUrl}/execution/${projectId}/execute/v1?apiKey=${token}`;
	axios.get(swaggerUri).then(({data}) => {
		const swagger = data;
		let res = readSwagger(swagger);
		const initialState = {
			requestSchema: res.request,
			responseSchema: res.response,
			executeRequest: executeRequest,
			result: null,
			res: {ruleapps: {}},
			error: null,
			router: {}
		};
		const store = createStore<any>(combineReducers({
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
				<Forms/>
			</Provider>
			,
			document.getElementById(rootId)
		);
	}).catch(error => {
		console.log(error);
		alert(error);
	});
};

export default renderForms;
