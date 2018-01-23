export const schemaVersion : string = "http://json-schema.org/draft-06/schema#";

export enum Type {
	TObject = "object",
	TString = "string",
	TArray = "array",
	TNumber = "number",
	TInteger = "integer",
	TBoolean = "boolean"
}

export enum Format {
	Html = "html",
	Markdown = "markdown",
	TextArea = "textarea",
	Double = "double",
	Int32 = "int32",
	Int64 = "int64",
	DateTime = "date-time",
	Date = "date",
	Time = "time"
}

export type SchemaDefinitions = { [s: string]: SchemaElement; };
export type SchemaProperties = { [s: string]: SchemaElement | SchemaElementRef; };
export type SchemaPatternProperties = { [s: string]: SchemaPatternProperty | SchemaElementRef; };

export interface SchemaElementRef {
	$ref: string;
	title?: string;
}

export interface SchemaElement {
	type: Type,
	title?: string,
	properties?: SchemaProperties,
	patternProperties?: SchemaPatternProperties,
	description?: string,
	minimum?: number,
	required?: string[],
	items?: SchemaElement | SchemaElementRef,
	format?: Format,
//	className?: string, // custom extension
	CustomSchemaAttributeHidden?: boolean, // custom extension
	CustomSchemaAttributeCyclic?: boolean, // custom extension
}

export interface SchemaPatternProperty extends SchemaElement{
	keyTitle?: string, // custom extension
	valueTitle?: string // custom extension
}

export interface RootSchemaElement extends SchemaElement {
	$schema: string,
	definitions?: SchemaDefinitions
}

export interface NormalizedRequestAndResponse {
	request: RootSchemaElement;
	response: RootSchemaElement;
}
