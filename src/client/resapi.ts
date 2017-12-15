import {ResState} from "./state";

const startCase = require('lodash.startcase');

const axios = require("axios");
const Promise = require('bluebird');
import {
	Format, RootSchemaElement, SchemaElement, Type, SchemaElementRef
} from "./schema";

export const loadSwagger = (rulesetPath: string): Promise<any> => {
	return axios.get(`/swagger` + rulesetPath).then(res => {
		const swagger = res.data;
		document.title = swagger.info.title.substr(0, swagger.info.title.length - ' API'.length);
		return Promise.resolve(readSwagger(swagger));
	})
};

export const readSwagger = (swagger) => {
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
	return {request: normalizedRequest, response: normalizedResponse};
};

export const normalizeSchema = (schema: RootSchemaElement): void => {
	if (schema.properties) {
		for (const key in schema.properties) {
			const value = schema.properties[key];
			if (!(value as any).$ref) {
				_normalizeSchema(value as SchemaElement, [], _title(key));
			}
		}
	}
	const graph: Dependency = { key: '', dependencies: [], parent: null };
	if (schema.definitions) {
		delete (schema.definitions.Request as SchemaElement)!.properties!['__DecisionID__'];
		delete (schema.definitions.Response as SchemaElement)!.properties!['__DecisionID__'];
		for (const key in schema.definitions) {
			const value = schema.definitions[key];
			graph.dependencies.push({
				key: key,
				dependencies: [],
				parent: graph
			});
			if (!(value as any).$ref) {
				_normalizeSchema(value as SchemaElement, [ key ], _title(key));
			}
		}
	}
};

interface Dependency {
	key: string;
	dependencies: Dependency[];
	parent: Dependency | null;
}

const _normalizeSchema = (schema: SchemaElement, stack: string[], title?: string): void => {
	// The form generator does not seem to support these cases...
	if (schema.type === Type.TNumber && schema.format === Format.Double) {
		delete schema.format;
	} else if (schema.type === Type.TInteger && (schema.format === Format.Int32 || schema.format === Format.Int64)) {
		delete schema.format;
	}
	if (title && !schema.title) {
		schema.title = title;
	}
	if (schema.properties) {
		for (const key in schema.properties) {
			const value = schema.properties[key];
			if (!(value as any).$ref) {
				_normalizeSchema(value as SchemaElement, stack, _title(key));
			}
		}
	}
};

const isPrimitive = (t: Type) : boolean => {
	switch (t) {
		case Type.TNumber:
		case Type.TInteger:
		case Type.TBoolean:
		case Type.TString:
			return true;
	}
	return false;
};

export const buildUiSchema = (root: RootSchemaElement): object => {
	const uiSchema = {
		"ui:order": ["*"]
	};
	_buildUiSchema(root, root, null, uiSchema);
	return uiSchema;
};

const _buildUiSchema = (schemaOrRef: SchemaElement | SchemaElementRef, root: RootSchemaElement, key: string | null, uiSchema: object): void => {
	if ((schemaOrRef as any).$ref) {
		const ref : SchemaElementRef = schemaOrRef as SchemaElementRef;
		if (key) {
			uiSchema[key] = {
				"ui:order": ["*"]
			};
		}
		const definitionName = ref.$ref.substr("#/definitions/".length);
		const definition: SchemaElement | SchemaElementRef = root.definitions![definitionName];
		_buildUiSchema(definition, root, key, uiSchema);
	} else {
		const schema : SchemaElement = schemaOrRef as SchemaElement;
		const type: Type = schema.type;
		if (isPrimitive(type)) {
			if (key) {
				uiSchema["ui:order"].splice(0, 0, key);
			}
		} else if (type === Type.TObject) {
			if (key) {
				uiSchema[key] = {
					"ui:order": ["*"]
				};
			}
			if (schema.properties) {
				for (const k in schema.properties) {
					const schemaOrRefChild = schema.properties[k];
					_buildUiSchema(schemaOrRefChild, root, k, key ? uiSchema[key] : uiSchema);
				}
			}
		} else if (type === Type.TArray && schema.items) {
			if ((schema.items as any).$ref || (schema.items as SchemaElement).type === Type.TObject || (schema.items as SchemaElement).type === Type.TArray) {
				if (key) {
					uiSchema[key] = {
						items: {
							"ui:order": ["*"]
						}
					};
				}
				const schemaOrRefItem : SchemaElement | SchemaElementRef = schema.items;
				_buildUiSchema(schemaOrRefItem, root, null, key ? uiSchema[key].items : uiSchema);
			}
		}
	}
};

const _title = (key: string) => {
	return startCase(decamelize(key, ' '));
};

export const loadRulesetPaths = (): Promise<ResState> => {
	return axios.get(`/rulesets`).then(res => {
		const rulesets = res.data;
		const ruleapps = {};
		for (let i = 0; i < rulesets.length; i++) {
			const rs = rulesets[i];
			const path = rs.id.split('/');
			const ruleappName = path[0];
//			const ruleappVersion = path[1];
			const rulesetName = path[2];
			const rulesetVersion = path[3];
			let ruleapp = ruleapps[ruleappName];
			if (!ruleapp) {
				ruleapp = {name: ruleappName, rulesets: {}};
				ruleapps[ruleappName] = ruleapp;
			}
			let ruleset = ruleapp.rulesets[rulesetName];
			if (!ruleset) {
				ruleset = {name: rulesetName, path: ruleappName + '/' + rulesetName, versions: {}};
				ruleapp.rulesets[rulesetName] = ruleset;
			}
			ruleset.versions[rulesetVersion] = {version: rulesetVersion, path: rs.id}
		}
		return Promise.resolve(ruleapps);
	});
};

const decamelize = (str, sep) => {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}
	sep = typeof sep === 'undefined' ? '_' : sep;
	return str
		.replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
		.toLowerCase();
};