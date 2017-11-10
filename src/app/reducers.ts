
import {ActionTypes, DefaultAction, DisplayErrorAction, ReceiveResultAction} from "./actions";
import {RootSchemaElement, Type} from "./schema";
import {ResState} from "./state";

export const schemaReducer = (state : RootSchemaElement = { $schema: '',  type: Type.TObject },
															action : DefaultAction) => {
	return state;
};

export const resultReducer = (state : any = null,
															action : ReceiveResultAction | DefaultAction) => {
	switch (action.type) {
		case ActionTypes.RECEIVE_RESULT:
			return action.payload;
		default:
			return state;
	}
};

export const errorReducer = (state : any = null, action : DisplayErrorAction | DefaultAction) => {
	switch (action.type) {
		case ActionTypes.DISPLAY_ERROR:
			return { title: action.title, status: action.status, message: action.message };
		default:
			return state;
	}
};

export const resReducer = (state : ResState = { paths: [] }, action : DefaultAction) => {
	return state;
};
