import {ResState} from "./state";

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
		normalizeSchema(requestSchema);
		const responseSchema = {
			$schema: "http://json-schema.org/draft-06/schema#",
			definitions: swagger.definitions,
			type: Type.TObject,
			properties: swagger.definitions.Response.properties
		} as RootSchemaElement;
		normalizeSchema(requestSchema);
		normalizeSchema(responseSchema);
		return Promise.resolve({ request: requestSchema, response: responseSchema });
	})
};
const valuesPolyfill = function values (object) {
	return Object.keys(object).map(key => object[key]);
};
const normalizeSchema = (schema: RootSchemaElement): void => {
	if (schema.properties) {
		valuesPolyfill(schema.properties).filter(s => !(s as any).$ref).map(s => _normalizeSchema(s as SchemaElement));
	}
	if (schema.definitions) {
		delete (schema.definitions.Request as SchemaElement)!.properties!['__DecisionID__'];
		delete (schema.definitions.Response as SchemaElement)!.properties!['__DecisionID__'];
		valuesPolyfill(schema.definitions).filter(s => !(s as any).$ref).map(s => _normalizeSchema(s as SchemaElement));
	}
};
const _normalizeSchema = (schema: SchemaElement): void => {
	// The form generator does not seem to support these cases...
	if (schema.type === Type.TNumber && schema.format === Format.Double) {
		delete schema.format;
	} else if (schema.type === Type.TInteger && schema.format === Format.Int32) {
		delete schema.format;
	}
	if (schema.properties) {
		valuesPolyfill(schema.properties).filter(s => !(s as any).$ref).map(s => _normalizeSchema(s as SchemaElement));
	}
};

export const loadRulesetPaths = (): Promise<ResState> => {
	return axios.get(`/rulesets`).then(res => {
		return Promise.resolve({ paths: res.data.map(r => r.id) });
	});
};