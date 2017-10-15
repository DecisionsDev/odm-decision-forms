import {Action} from "redux";
import {State} from "./state";
import axios from 'axios';
import {ActionCreator} from "react-redux";

export const enum ActionTypes {
	RECEIVE_RESULT,
	DISPLAY_ERROR,
	DEFAULT_ACTION = "__any_other_action_type__"
}

export interface DefaultAction extends Action {
	type: ActionTypes.DEFAULT_ACTION
}

export interface ReceiveResultAction extends Action {
	type: ActionTypes.RECEIVE_RESULT;
	payload: object;
}

export const receiveResult: ActionCreator<ReceiveResultAction> = (payload) : ReceiveResultAction => ({
	type: ActionTypes.RECEIVE_RESULT,
	payload: payload
});

export const execute = (payload) => {
	return (dispatch: (a: ReceiveResultAction | DisplayErrorAction) => ReceiveResultAction, getState: () => State) => {
		const rulesetPath = getState().router.location.pathname.substr('/ruleapp'.length);
		axios.post('/execute' + rulesetPath, { request: payload }).then(res => {
			dispatch(receiveResult(res.data));
		}).catch(err => {
			dispatch(displayError("Error executing Rule Service", err.response.data, err.response.statusText));
			console.log('Error while invoking decision service: ' + err);
		});
	};
};

export interface DisplayErrorAction extends Action {
	type: ActionTypes.DISPLAY_ERROR;
	title: string;
	status: string;
	message: string;
}

export const displayError: ActionCreator<DisplayErrorAction> = (title: string, message: string, status: string) : DisplayErrorAction => ({
	type: ActionTypes.DISPLAY_ERROR,
	title: title,
	message: message,
	status: status
});

