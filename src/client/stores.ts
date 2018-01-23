import {
	DecisionStatus, FormController, FormsState, HomeState, Options, Page, ResState, StandaloneFormState,
	WebRequest
} from "./state";
import {combineReducers, createStore, GenericStoreEnhancer, Store, StoreEnhancer} from "redux";
import {emptyReducer, optionsReducer, responseReducer} from "./reducers";
import {NormalizedRequestAndResponse, RootSchemaElement} from "./schema";

export const createFormsStore = (res: NormalizedRequestAndResponse,
																 executeRequest: WebRequest,
																 options: Options,
																 storeEnhancer: GenericStoreEnhancer): Store<FormsState> => {
	const initialState: FormsState = {
		requestSchema: res.request,
		responseSchema: res.response,
		executeRequest: executeRequest,
		executeResponse: {status: DecisionStatus.NotRun},
		options: options,
		page: Page.inout
	};
	return createStore(combineReducers({
			requestSchema: emptyReducer,
			responseSchema: emptyReducer,
			executeRequest: emptyReducer,
			page: emptyReducer,
			options: optionsReducer,
			executeResponse: responseReducer
		}),
		initialState,
		storeEnhancer
	);
};

export const createHomeStore = (resState: ResState, storeEnhancer: GenericStoreEnhancer): Store<HomeState> => {
	return createStore<HomeState>(combineReducers({
			res: emptyReducer,
			page: emptyReducer
		}), {
			res: resState,
			page: Page.home
		},
		storeEnhancer
	)
};

export const createStandaloneFormStore = (schema: RootSchemaElement,
																					data: object,
																					controller: FormController,
																					options: Options,
																					storeEnhancer: GenericStoreEnhancer) : Store<StandaloneFormState> => {
	return createStore<StandaloneFormState>(combineReducers({
			schema: emptyReducer,
			data: emptyReducer,
			controller: emptyReducer,
			options: optionsReducer,
			page: emptyReducer
		}), {
			schema: schema,
			data: data,
			controller: controller,
			options: options,
			page: Page.standalone
		},
		storeEnhancer
	)
};