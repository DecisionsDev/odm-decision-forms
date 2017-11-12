import {
	Format, RootSchemaElement, SchemaElement, SchemaElementRef, SchemaPatternProperty, SchemaProperties, schemaVersion,
	Type
} from "./schema";
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

export interface State {
	requestSchema: RootSchemaElement | null;
	responseSchema: RootSchemaElement | null;
	result: object | null;
	error: Error | null;
	router: RouterState;
	res: ResState;
}

