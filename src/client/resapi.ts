import {ResState} from "./state";

const startCase = require('lodash.startcase');

const axios = require("axios");
const Promise = require('bluebird');
import {
	Format, RootSchemaElement, SchemaElement, Type, SchemaElementRef, SchemaDefinitions
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
//	delete (normalizedRequest as SchemaElement)!.properties!['__DecisionID__'];
	normalizeSchema(normalizedRequest);
	const responseSchema = {
		$schema: "http://json-schema.org/draft-06/schema#",
		definitions: swagger.definitions,
		type: Type.TObject,
		properties: swagger.definitions.Response.properties
	} as RootSchemaElement;
	const normalizedResponse = JSON.parse(JSON.stringify(responseSchema));
//	delete (normalizedResponse as SchemaElement)!.properties!['__DecisionID__'];
	normalizeSchema(normalizedResponse);
	return {request: normalizedRequest, response: normalizedResponse};
};

interface Context {
	dependencies: { [s: string]: string[]; },
	current: string | null,
	definitions: SchemaDefinitions,
	schema: RootSchemaElement
}

export const normalizeSchema = (schema: RootSchemaElement): void => {
	const context: Context = {
		dependencies: {},
		current: null,
		definitions: {},
		schema: schema
	};
	// if (schema.definitions) {
	// 	if (schema.definitions.Request) {
	// 		delete (schema.definitions.Request as SchemaElement)!.properties!['__DecisionID__'];
	// 	}
	// 	if (schema.definitions.Response) {
	// 		delete (schema.definitions.Response as SchemaElement)!.properties!['__DecisionID__'];
	// 	}
	// }
	_normalizeSchema(schema, context);
	schema.definitions = context.definitions;
};


const _normalizeSchema = (schema: SchemaElement, context: Context, title?: string): void => {
	// The form generator does not seem to support these cases...
	if (schema.type) {
		if (schema.type === Type.TNumber && schema.format === Format.Double) {
			delete schema.format;
		} else if (schema.type === Type.TInteger && (schema.format === Format.Int32 || schema.format === Format.Int64)) {
			delete schema.format;
		}
	}
	if (title && !schema.title) {
		schema.title = title;
	}
	if (schema.properties) {
		for (const key in schema.properties) {
			let value : SchemaElement | SchemaElementRef = schema.properties[key];
			let propertyTitle = _title(key);
			if ((value as any).items) {
				if (propertyTitle && !(value as SchemaElement).title) {
					(value as SchemaElement).title = propertyTitle;
				}
				value = (value as any).items;
				propertyTitle = null;
			}
			if ((value as any).$ref) {
				const ref: SchemaElementRef = value as SchemaElementRef;
				if (propertyTitle && !ref.title) {
					ref.title = propertyTitle;
				}
				const name = resolveRef(ref.$ref);
				let processedDefinition = context.definitions[name];
				const current = context.current;
				if (!processedDefinition) {
					context.current = name;
					processedDefinition = context.schema.definitions![name];
					context.definitions[name] = processedDefinition;
					_normalizeSchema(processedDefinition as SchemaElement, context, _title(name));
					context.current = current;
				}
				if (current) {
					const defDependencies = context.dependencies[name];
					if (name === current || (defDependencies && defDependencies.indexOf(current) != -1)) {
						// This referenced definition has already been explored
						// If the current definition being explored is already a dependency of the referenced definition,
						// we have a cyclic dependency.
						// Replace by a string, with a warning in the description
						const message = `Warning: replaced cyclic reference (${current} => ${key}: ${name}) with a string property`;
						console.log(message);
						schema.properties[key] = {
							type: Type.TString,
							title: propertyTitle,
							description: message
						} as SchemaElement;
					} else {
						if (context.dependencies[current]) {
							context.dependencies[current].push(name);
						} else {
							context.dependencies[current] = [ name ];
						}
					}
				}
			} else {
				const childSchemaElement = value as SchemaElement;
				_normalizeSchema(childSchemaElement, context, propertyTitle);
			}
		}
	}
};

const resolveRef = ($ref: string): string => {
	return $ref.substr("#/definitions/".length);
};

const isPrimitive = (t: Type): boolean => {
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
		"ui:order": ["*"],
		"classNames": `field-depth-0`,
		"__DecisionID__": {"ui:widget": "hidden"}
	};
	_buildUiSchema(root, root, null, uiSchema, 0);
	return uiSchema;
};

const _buildUiSchema = (schemaOrRef: SchemaElement | SchemaElementRef, root: RootSchemaElement, key: string | null, uiSchema: object, depth: number): void => {
	if ((schemaOrRef as any).$ref) {
		const ref: SchemaElementRef = schemaOrRef as SchemaElementRef;
		if (key) {
			uiSchema[key] = {
				"ui:order": ["*"],
				"classNames": `field-depth-${depth}`
			};
		}
		const definitionName = resolveRef(ref.$ref);
		const definition: SchemaElement | SchemaElementRef = root.definitions![definitionName];
		_buildUiSchema(definition, root, key, uiSchema, depth);
	} else {
		const schema: SchemaElement = schemaOrRef as SchemaElement;
		const type: Type = schema.type;
		if (isPrimitive(type)) {
			if (key) {
				uiSchema["ui:order"].splice(0, 0, key);
			}
		} else if (type === Type.TObject) {
			if (key) {
				uiSchema[key] = {
					"ui:order": ["*"],
					"classNames": `field-depth-${depth}`
				};
			}
			if (schema.properties) {
				for (const k in schema.properties) {
					const schemaOrRefChild = schema.properties[k];
					_buildUiSchema(schemaOrRefChild, root, k, key ? uiSchema[key] : uiSchema, depth + 1);
				}
			}
		} else if (type === Type.TArray && schema.items) {
			if ((schema.items as any).$ref || (schema.items as SchemaElement).type === Type.TObject || (schema.items as SchemaElement).type === Type.TArray) {
				if (key) {
					uiSchema[key] = {
						items: {
							"ui:order": ["*"],
							"classNames": `field-depth-${depth}`
						}
					};
				}
				const schemaOrRefItem: SchemaElement | SchemaElementRef = schema.items;
				_buildUiSchema(schemaOrRefItem, root, null, key ? uiSchema[key].items : uiSchema, depth +1);
			}
		}
	}
};

const _title = (key: string) => {
	return startCase(decamelize(key, ' '));
};

interface LocalTime {
	hour: number;
	minute: number;
	second: number;
	nano: number;
}

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