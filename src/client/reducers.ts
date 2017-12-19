
import {ActionTypes, DefaultAction, DisplayErrorAction, ReceiveResultAction} from "./actions";
import {RootSchemaElement, Type} from "./schema";
import {
	WebRequest, ResState, DecisionState, decisionStatusNotRun, decisionStatusResult, decisionStatusError, DecisionResult, DecisionError, DecisionNotRun
} from "./state";

export const schemaReducer = (state : RootSchemaElement = { $schema: '',  type: Type.TObject },
															action : DefaultAction) => {
	return state;
};

export const requestReducer = (state : WebRequest = { url: '',  headers: {}, transformPayload: data => data, transformResult: result => result },
															action : DefaultAction) => {
	return state;
};

export const responseReducer = (state : DecisionState = { status: decisionStatusNotRun },
																action : ReceiveResultAction | DisplayErrorAction | DefaultAction) : DecisionState => {
	switch (action.type) {
		case ActionTypes.RECEIVE_RESULT:
			return {
				status: decisionStatusResult,
				result: action.payload,
				start: action.startDate,
				end: action.endDate
			};
		case ActionTypes.DISPLAY_ERROR:
			return {
				status: decisionStatusError,
				error: { title: action.title, status: action.status, message: action.message },
				start: action.executionStart
			};
		default:
			return state;
	}
};

export const resReducer = (state : ResState = { ruleapps: {} }, action : DefaultAction) => {
	return state;
};
