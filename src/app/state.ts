import {
	Format, RootSchemaElement, SchemaElement, SchemaElementRef, SchemaPatternProperty, SchemaProperties, schemaVersion,
	Type
} from "./schema";
import { RouterState } from 'react-router-redux';

export interface Error {
	title: string;
	message: string;
	status?: string;
}

export interface ResState {
	paths: string[];
}

export interface State {
	requestSchema: RootSchemaElement | null;
	responseSchema: RootSchemaElement | null;
	result: object | null;
	error: Error | null;
	router: RouterState;
	res: ResState;
}

