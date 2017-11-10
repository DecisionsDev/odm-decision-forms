import {ResState} from "./state";
import decamelize from 'decamelize';
import * as _ from "lodash";

var axios = require("axios");
var Promise = require('bluebird');
import {
	Format, RootSchemaElement, SchemaElement, SchemaElementRef, SchemaPatternProperty, SchemaProperties, schemaVersion,
	Type
} from "./schema";

export const loadSwagger = (rulesetPath: string): Promise<any> => {
	return axios.get(`/swagger` + rulesetPath).then(res => {
		const swagger = res.data;
		document.title = swagger.info.title.substr(0, swagger.info.title.length - ' API'.length);
		const requestSchema = {
			$schema: "http://json-schema.org/draft-06/schema#",
			definitions: swagger.definitions,
			type: Type.TObject,
			properties: swagger.definitions.Request.properties
		} as RootSchemaElement;
		const normalizedRequest = JSON.parse(JSON.stringify(requestSchema));
		delete (normalizedRequest as SchemaElement)!.properties!['__DecisionID__'];
		normalizeSchema(normalizedRequest);
		const responseSchema = {
			$schema: "http://json-schema.org/draft-06/schema#",
			definitions: swagger.definitions,
			type: Type.TObject,
			properties: swagger.definitions.Response.properties
		} as RootSchemaElement;
		const normalizedResponse = JSON.parse(JSON.stringify(responseSchema));
		delete (normalizedResponse as SchemaElement)!.properties!['__DecisionID__'];
		normalizeSchema(normalizedResponse);
		return Promise.resolve({ request: normalizedRequest, response: normalizedResponse });
	})
};

const valuesPolyfill = function values (object) {
	return Object.keys(object).map(key => object[key]);
};
export const normalizeSchema = (schema: RootSchemaElement): void => {
	if (schema.properties) {
		for (const key in schema.properties) {
			const value = schema.properties[key];
			if (!(value as any).$ref) {
				_normalizeSchema(value as SchemaElement, _title(key));
			}
		}
	}
	if (schema.definitions) {
		delete (schema.definitions.Request as SchemaElement)!.properties!['__DecisionID__'];
		delete (schema.definitions.Response as SchemaElement)!.properties!['__DecisionID__'];
		for (const key in schema.definitions) {
			const value = schema.definitions[key];
			if (!(value as any).$ref) {
				_normalizeSchema(value as SchemaElement, _title(key));
			}
		}
//		valuesPolyfill(schema.definitions).filter(s => !(s as any).$ref).map(s => _normalizeSchema(s as SchemaElement));
	}
};
const _normalizeSchema = (schema: SchemaElement, title?: string): void => {
	// The form generator does not seem to support these cases...
	if (schema.type === Type.TNumber && schema.format === Format.Double) {
		delete schema.format;
	} else if (schema.type === Type.TInteger && (schema.format === Format.Int32 || schema.format === Format.Int64)) {
		delete schema.format;
	}
	if (title) {
		schema.title = title;
	}
	if (schema.properties) {
		for (const key in schema.properties) {
			const value = schema.properties[key];
			if (!(value as any).$ref) {
				_normalizeSchema(value as SchemaElement, _title(key));
			}
		}
	}
};

const _title = (key: string) => {
	return _.startCase(decamelize(key, ' '));
};

export const loadRulesetPaths = (): Promise<ResState> => {
	return axios.get(`/rulesets`).then(res => {
		return Promise.resolve({ paths: res.data.map(r => r.id) });
	});
};