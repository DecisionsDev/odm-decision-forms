import {RootSchemaElement} from "./schema";
import {RouterState} from 'react-router-redux';

require('es6-map/implement');

export interface Error {
	title: string;
	message: string;
	status?: string;
}

export interface ResState {
	ruleapps: { [key: string]: RuleApp; }
}

export interface RuleApp {
	name: string;
	rulesets: { [key: string]: Ruleset; };
}

export interface Ruleset {
	name: string;
	path: string;
	versions: { [key: string]: RulesetVersion; }
}

export interface RulesetVersion {
	version: string;
	path: string;
}

export interface WebRequest {
	url: string;
	headers?: { [key: string]: string; },
	transformPayload: (payload) => {},
	transformResult: (result) => {}
}

export enum DateFormat {
	Widget = "Widget",
	TextField = "TextField"
}

export interface Options {
	liveValidation: boolean;
	dateFormat: DateFormat;
}

export const defaultOptions: Options = {
	liveValidation: true,
	dateFormat: DateFormat.Widget
};

export type DecisionStatusNotRun = "not-runyet";
export type DecisionStatusResult = "decision-has-result";
export type DecisionStatusError = "decision-threw-error";
export type DecisionStatusType = DecisionStatusNotRun | DecisionStatusResult | DecisionStatusError;

export const DecisionStatus = {
	NotRun: "not-runyet" as DecisionStatusNotRun,
	Result: "decision-has-result" as DecisionStatusResult,
	Error: "decision-threw-error" as DecisionStatusError
};

export interface WithDecisionStatus {
	status: DecisionStatusType;
}

export interface DecisionResult extends WithDecisionStatus {
	status: DecisionStatusResult;
	result: object;
	start: Date;
	end: Date;
}

export interface DecisionError extends WithDecisionStatus {
	status: DecisionStatusError;
	error: Error;
	start: Date;
}

export interface DecisionNotRun extends WithDecisionStatus {
	status: DecisionStatusNotRun;
}

export type DecisionState = DecisionResult | DecisionError | DecisionNotRun;

export interface PageState {
	page: Page;
}

export interface HomeState extends PageState {
	res: ResState;
	page: Page.home;
}

export interface FormsState extends PageState {
	requestSchema: RootSchemaElement;
	responseSchema: RootSchemaElement;
	executeRequest: WebRequest;
	executeResponse: DecisionState;
	options: Options;
	page: Page.inout;
}

export interface StandaloneFormState extends PageState {
	schema: RootSchemaElement;
	data: object;
	options: Options;
	controller: FormController;
	page: Page.standalone;
}

export type AppState = HomeState | FormsState;

export enum Page {
	home, inout, standalone
}

export type FormDataConsumer = (object) => void;

export interface FormHandlers {
	onSubmit?: FormDataConsumer;
	onChange?: FormDataConsumer;
	onError?: (any) => void;
}

export class FormController {

	private submitter: () => void;
	private handlers: FormHandlers;

	constructor(handlers: FormHandlers) {
		this.handlers = handlers;
	}

	submit(): void {
		this.submitter();
	}

	/*
	 * Internal methods
	 */
	handleOnSubmit(data: object) {
		if (this.handlers.onSubmit) {
			this.handlers.onSubmit(data);
		}
	}

	handleOnError(error) {
		if (this.handlers.onError) {
			this.handlers.onError(error);
		}
	}

	handleOnChange(data: object) {
		if (this.handlers.onChange) {
			this.handlers.onChange(data);
		}
	}

	setSubmitter(f: () => void) {
		this.submitter = f;
	}
}
