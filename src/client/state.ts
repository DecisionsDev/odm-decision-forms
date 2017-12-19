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

export interface WebResponse {
	result: object | null;
	lastStart: Date;
	lastEnd: Date
}

export interface State {
	requestSchema: RootSchemaElement | null;
	responseSchema: RootSchemaElement | null;
	executeRequest: WebRequest;
	result: object | null;
	error: Error | null;
	router: RouterState;
	res: ResState;
}

