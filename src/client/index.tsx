import * as React from "react";
import * as ReactDOM from 'react-dom';
import {applyMiddleware, combineReducers, createStore} from "redux";
import {Provider} from "react-redux";
import App from "./components/App";
import Error from "./components/Error";

const styles = require('./main.scss');

import thunkMiddleware from 'redux-thunk';
import {ConnectedRouter, routerMiddleware} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';
import {loadRulesetPaths, loadSwagger} from "./resapi";
import {DecisionStatus, defaultOptions, FormsState, HomeState, ResState} from "./state";
import {responseReducer, emptyReducer, optionsReducer} from "./reducers";

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

loadRulesetPaths()
	.then((resState: ResState) => {
		if (history && (history as any).location && ((history as any).location as any).pathname) {
			const rulesetPath = ((history as any).location as any).pathname!;
			if (rulesetPath.indexOf('/ruleapp') == 0) {
				return loadSwagger(rulesetPath.substr('/ruleapp'.length), defaultOptions)
					.then(({request, response}) => {
						const initialState: FormsState = {
							requestSchema: request,
							responseSchema: response,
							executeRequest: {
								url: '/execute' + rulesetPath.substr('/ruleapp'.length),
								transformPayload: payload => ({ request: payload }),
								transformResult: result => result
							},
							executeResponse: { status : DecisionStatus.NotRun },
							options: defaultOptions
						};
						const store = createStore<FormsState>(combineReducers({
								requestSchema: emptyReducer,
								responseSchema: emptyReducer,
								executeRequest: emptyReducer,
								options: optionsReducer,
								executeResponse: responseReducer,
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
		const initialState: HomeState = {
			res: resState,
		};
		const store = createStore<HomeState>(combineReducers({
				res: emptyReducer,
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
