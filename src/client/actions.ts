import {Action} from "redux";
import {State} from "./state";
import axios from 'axios';
import {ActionCreator} from "react-redux";
import {normalizePayload} from "./resapi";

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
	startDate: Date;
	endDate: Date;
}

export const receiveResult: ActionCreator<ReceiveResultAction> = (payload: object, startDate: Date, endDate: Date) : ReceiveResultAction => ({
	type: ActionTypes.RECEIVE_RESULT,
	payload: payload,
	startDate: startDate,
	endDate: endDate
});

export const execute: any = (payload) => {
	return (dispatch: (a: ReceiveResultAction | DisplayErrorAction) => ReceiveResultAction, getState: () => State) => {
		// axios.post(getState().executeRequest!.url, { request: payload }).then(res => {
		const executeRequest = getState().executeRequest;
		let identity = a => a;
		let transformPayload = executeRequest!.transformPayload || identity;
		let transformResult = executeRequest!.transformResult || identity;
		let headers = executeRequest!.headers || {};
		const startDate = new Date();
		axios.post(executeRequest!.url, transformPayload(normalizePayload(getState().requestSchema!, payload)), { headers: headers }).then(res => {
			const endDate = new Date();
			dispatch(receiveResult(transformResult(res.data), startDate, endDate));
		}).catch(err => {
			dispatch(displayError("Error invoking Decision", err.response.data, err.response.statusText, startDate));
			console.log('Error while invoking decision service: ' + err);
		});
	};
};

export interface DisplayErrorAction extends Action {
	type: ActionTypes.DISPLAY_ERROR;
	executionStart: Date;
	title: string;
	status: string;
	message: string;
}

export const displayError: ActionCreator<DisplayErrorAction> = (title: string, message: string, status: string, executionStart: Date) : DisplayErrorAction => ({
	type: ActionTypes.DISPLAY_ERROR,
	executionStart: executionStart,
	title: title,
	message: message,
	status: status
});

