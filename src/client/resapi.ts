import {DateFormat, defaultOptions, Options, ResState} from "./state";

const startCase = require('lodash.startcase');

const axios = require("axios");
import {
	Format, RootSchemaElement, SchemaElement, Type, SchemaElementRef, SchemaDefinitions, NormalizedRequestAndResponse
} from "./schema";
import {enumValues, flatMap, sortNumbers, valuesPolyfill} from "./utils";

export const loadSwagger = (rulesetPath, options: Options = defaultOptions): Promise<any> => {
	return axios.get(`/swagger` + rulesetPath).then(res => {
		const swagger = res.data;
		document.title = swagger.info.title.substr(0, swagger.info.title.length - ' API'.length);
		return Promise.resolve(readSwagger(swagger, options));
	})
};

export const readSwagger = (swagger, options: Options = defaultOptions): NormalizedRequestAndResponse => {
	const requestSchema = {
		$schema: "http://json-schema.org/draft-06/schema#",
		definitions: swagger.definitions,
		type: Type.TObject,
		properties: swagger.definitions.Request.properties
	} as RootSchemaElement;
	const normalizedRequest : RootSchemaElement = JSON.parse(JSON.stringify(requestSchema));
//	delete (normalizedRequest as SchemaElement)!.properties!['__DecisionID__'];
	normalizeSchema(normalizedRequest, options);
	const responseSchema = {
		$schema: "http://json-schema.org/draft-06/schema#",
		definitions: swagger.definitions,
		type: Type.TObject,
		properties: swagger.definitions.Response.properties
	} as RootSchemaElement;
	const normalizedResponse : RootSchemaElement = JSON.parse(JSON.stringify(responseSchema));
//	delete (normalizedResponse as SchemaElement)!.properties!['__DecisionID__'];
	normalizeSchema(normalizedResponse, options);
	return { request: normalizedRequest, response: normalizedResponse};
};

interface Context {
	dependencies: { [s: string]: string[]; },
	current: string | null,
	definitions: SchemaDefinitions,
	schema: RootSchemaElement,
	options: Options
}

export const normalizeSchema = (schema, options): void => {
	const context: Context = {
		dependencies: {},
		current: null,
		definitions: {},
		schema: schema,
		options: options
	};
	_normalizeSchema(schema, context);
	if (schema.properties && schema.properties.__DecisionID__) {
		(schema.properties.__DecisionID__ as SchemaElement).CustomSchemaAttributeHidden = true;
	}
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
						const message = `Warning: replaced cyclic reference (${current} => ${key}: ${name}) with a JSON string property.`;
						console.log(message);
						schema.properties[key] = {
							type: Type.TString,
							title: propertyTitle,
							description: message,
							CustomSchemaAttributeCyclic: true
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

export const normalizePayload = (schema: RootSchemaElement, result: any): any => {
	return _normalizePayload(schema, schema, result);
};

const _normalizePayload = (schema: RootSchemaElement, schemaElementOrRef: SchemaElement | SchemaElementRef, result: any): any => {
	let schemaElement: SchemaElement;
	if ((schemaElementOrRef as any).$ref) {
		const schemaRef = schemaElementOrRef as SchemaElementRef;
		schemaElement = schema.definitions![resolveRef(schemaRef.$ref)];
	} else {
		schemaElement = schemaElementOrRef as SchemaElement;
	}
	if (schemaElement.CustomSchemaAttributeCyclic) {
		// Convert result to object
		return JSON.parse(result);
	}
	if (schemaElement.type === Type.TObject) {
		const newResult = {};
		Object.keys(schemaElement.properties || {})
			.filter(k => result[k] !== undefined) // to keep values like '0' or 'false' (checkboxes)
			.forEach(k => {
                newResult[k] = _normalizePayload(schema, schemaElement.properties![k], result[k]);
			});
		return newResult;
	} else if (schemaElement.type === Type.TArray) {
		if (result) {
			return result.map(item => _normalizePayload(schema, schemaElement.items!, item));
		}
	}
	return result;
};

const isPrimitive = (x: Type | SchemaElement | SchemaElementRef): boolean => {
	if (typeof x === "string") {
		switch (x) {
			case Type.TNumber:
			case Type.TInteger:
			case Type.TBoolean:
			case Type.TString:
				return true;
		}
	} else if ((x as any).type) {
		return isPrimitive((x as SchemaElement).type);
	}
	return false;
};

export const buildUiSchema = (root: RootSchemaElement, options: Options): object => {
	const uiSchema = {
		"ui:order": ["*"],
		"classNames": `field-depth-0`
	};
	_buildUiSchema(root, root, null, uiSchema, 0, options);
	return uiSchema;
};

const addClass = (uiSchema, key, className) => {
	if (uiSchema[key]) {
		if (uiSchema[key].classNames) {
			uiSchema[key].classNames = uiSchema[key].classNames + ' ' + className;
		} else {
			uiSchema[key].classNames = className;
		}
	} else {
		uiSchema[key] = { classNames: className };
	}
};

const setOption = (uiSchema, key, name, value) => {
	if (!uiSchema[key]) {
		uiSchema[key] = {};
	}
	if (!uiSchema[key]['ui:options']) {
		uiSchema[key]['ui:options'] = {};
	}
	uiSchema[key]['ui:options'][name] = value;
};

const setWidget = (uiSchema, key, widget) => {
	if (!uiSchema[key]) {
		uiSchema[key] = {};
	}
	uiSchema[key]["ui:widget"] = widget;
};
const setHelp = (uiSchema, key, text) => {
	if (!uiSchema[key]) {
		uiSchema[key] = {};
	}
	uiSchema[key]["ui:help"] = text;
};
const setPlaceHolder = (uiSchema, key, placeholder) => {
	if (!uiSchema[key]) {
		uiSchema[key] = {};
	}
	uiSchema[key]["ui:placeholder"] = placeholder;
};

const isSmallTextField = (schemaOrRef: SchemaElement | SchemaElementRef): boolean => {
	if (!(schemaOrRef as any).$ref) {
		const schemaElement: SchemaElement = schemaOrRef as SchemaElement;
		return [ Type.TString, Type.TNumber, Type.TInteger ].indexOf(schemaElement.type) != -1
			&& !schemaElement.CustomSchemaAttributeCyclic
			&& !schemaElement.CustomSchemaAttributeHidden;
	}
	return false;
};

const isHidden = (schemaOrRef: SchemaElement | SchemaElementRef): boolean => {
	if (!(schemaOrRef as any).$ref) {
		const schemaElement: SchemaElement = schemaOrRef as SchemaElement;
		return schemaElement.CustomSchemaAttributeHidden === true;
	}
	return false;
};

const isCyclic = (schemaOrRef: SchemaElement | SchemaElementRef): boolean => {
	if (!(schemaOrRef as any).$ref) {
		const schemaElement: SchemaElement = schemaOrRef as SchemaElement;
		return schemaElement.CustomSchemaAttributeCyclic === true;
	}
	return false;
};

const isDate = (schemaOrRef: SchemaElement | SchemaElementRef): boolean => {
	if (!(schemaOrRef as any).$ref) {
		const schemaElement: SchemaElement = schemaOrRef as SchemaElement;
		return schemaElement.format === Format.Date
			|| schemaElement.format === Format.DateTime
			|| schemaElement.format === Format.Time;
	}
	return false;
};

const containsWord = (str: string, word: string) : boolean => {
	return !!str && !!word && new RegExp('\\b' + word.toLowerCase() + '\\b').test(str.toLowerCase());
};

let rk = 0;
enum Rank {
	Id = rk++,
	Name = rk++,
	String = rk++,
	Boolean = rk++,
	Number = rk++,
	Date = rk++,
	Other = rk++,
	Max = rk++
}

const rank = (schemaOrRef: SchemaElement | SchemaElementRef) : Rank => {
	if (!(schemaOrRef as any).$ref) {
		const schemaElement: SchemaElement = schemaOrRef as SchemaElement;
		const type = schemaElement.type;
		const title = schemaElement.title;
		if (schemaElement.CustomSchemaAttributeCyclic) {
			return Rank.Other;
		}
		if (schemaElement.CustomSchemaAttributeHidden) {
			return Rank.Max;
		}
		switch (type) {
			case Type.TString:
				if (schemaElement.format) {
					switch (schemaElement.format) {
						case Format.Date:
						case Format.Time:
						case Format.DateTime:
							return Rank.Date;
					}
				}
				if (title) {
					if (containsWord(title, "id") || containsWord(title, "uuid")) {
						return Rank.Id;
					}
					if (containsWord(title, "name")) {
						return Rank.Name;
					}
				}
				return Rank.String;
			case Type.TBoolean:
				return Rank.Boolean;
			case Type.TInteger:
			case Type.TNumber:
				if (title && containsWord(title, "id")) {
					return Rank.Id;
				}
				return Rank.Number;
		}
	}
	return Rank.Max;
};

const _buildUiSchema = (schemaOrRef: SchemaElement | SchemaElementRef,
												root: RootSchemaElement,
												key: string | null,
												uiSchema: object,
												depth: number,
												options: Options): void => {
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
		_buildUiSchema(definition, root, key, uiSchema, depth, options);
	} else {
		const schema: SchemaElement = schemaOrRef as SchemaElement;
		const type: Type = schema.type;
		if (isPrimitive(type)) {
			if (key) {
				uiSchema["ui:order"].splice(uiSchema["ui:order"].length - 1, 0, key);
			}
		} else if (type === Type.TObject) {
			if (key) {
				uiSchema[key] = {
					"ui:order": ["*"],
					"classNames": `field-depth-${depth}`
				};
			}
			if (schema.properties) {
				let childUiSchema = key ? uiSchema[key] : uiSchema;
				const rankToProperties : { [r: number]: string[]; } = {};
				enumValues(Rank).map(rankValue => (rankToProperties[rankValue] = []));
				for (const k in schema.properties) {
					const schemaOrRefChild = schema.properties[k];
					_buildUiSchema(schemaOrRefChild, root, k, childUiSchema, depth + 1, options);
					if (isHidden(schemaOrRefChild)) {
						setWidget(childUiSchema, k, "hidden");
					}
					if (isCyclic(schemaOrRefChild)) {
						addClass(childUiSchema, k, "field-warning");
						setWidget(childUiSchema, k, "textarea");
						setOption(childUiSchema, k, "rows", 2);
						setPlaceHolder(childUiSchema, k, "{...}")
					}
					if (options && options.dateFormat === DateFormat.TextField
						&& isDate(schemaOrRefChild)) {
						setWidget(childUiSchema, k, "text");
						setHelp(childUiSchema, k, "Enter a date. eg: 2018-01-11T03:05:00.000Z");
					}
					rankToProperties[rank(schemaOrRefChild)].push(k);
				}
				childUiSchema["ui:order"] = flatMap(
					rankValue => rankToProperties[rankValue],
					sortNumbers(Object.keys(rankToProperties))
				);
				let lastTextFieldKey : string | null = null;
				let textFieldEven = false;
				// Now mark small text field and last text field - used in CSS
				childUiSchema["ui:order"].map(k => {
					const schemaOrRefChild = schema.properties![k];
					if (isPrimitive(schemaOrRefChild)) {
						if (isSmallTextField(schemaOrRefChild)) {
							addClass(childUiSchema, k, 'field-small-textfield');
							// Mark the last odd text field so that we can make it span on 2 columns in CSS
							lastTextFieldKey = k;
							textFieldEven = !textFieldEven;
						} else {
							if (textFieldEven && lastTextFieldKey) {
								addClass(childUiSchema, lastTextFieldKey, 'field-last-textfield');
							}
							lastTextFieldKey = null;
							textFieldEven = false;
						}
					}
				});
				if (textFieldEven && lastTextFieldKey) {
					addClass(childUiSchema, lastTextFieldKey, 'field-last-textfield');
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
				_buildUiSchema(schemaOrRefItem, root, null, key ? uiSchema[key].items : uiSchema, depth +1, options);
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