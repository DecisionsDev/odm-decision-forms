
import {ActionTypes, DefaultAction, DisplayErrorAction, ReceiveResultAction} from "./actions";
import {RootSchemaElement, Type} from "./schema";
import {
	WebRequest, ResState, DecisionState, DecisionResult,
	DecisionError, DecisionNotRun, DecisionStatus
} from "./state";

export const schemaReducer = (state : RootSchemaElement = { $schema: '',  type: Type.TObject },
															action : DefaultAction) => {
	return state;
};

export const requestReducer = (state : WebRequest = { url: '',  headers: {}, transformPayload: data => data, transformResult: result => result },
															action : DefaultAction) => {
	return state;
};

export const responseReducer = (state : DecisionState = { status: DecisionStatus.NotRun },
																action : ReceiveResultAction | DisplayErrorAction | DefaultAction) : DecisionState => {
	switch (action.type) {
		case ActionTypes.RECEIVE_RESULT:
			return {
				status: DecisionStatus.Result,
				result: action.payload,
				start: action.startDate,
				end: action.endDate
			};
		case ActionTypes.DISPLAY_ERROR:
			return {
				status: DecisionStatus.Error,
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
