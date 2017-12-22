import { RootSchemaElement } from "./schema";
import { RouterState } from 'react-router-redux';
require('es6-map/implement');

export interface Error {
	title: string;
	message: string;
	status?: string;
}

export interface ResState {
	ruleapps: { [key:string]:RuleApp; }
}

export interface RuleApp {
	name: string;
	rulesets: { [key:string]:Ruleset; };
}

export interface Ruleset {
	name: string;
	path: string;
	versions: { [key:string]:RulesetVersion; }
}

export interface RulesetVersion {
	version: string;
	path: string;
}

export interface WebRequest {
	url: string;
	headers?: { [key:string]:string; },
	transformPayload: (payload) => {},
	transformResult: (result) => {}
}

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

export interface State {
	requestSchema: RootSchemaElement | null;
	responseSchema: RootSchemaElement | null;
	executeRequest: WebRequest;
	executeResponse: DecisionState;
	router: RouterState;
	res: ResState;
}

