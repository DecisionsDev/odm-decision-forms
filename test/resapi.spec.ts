const decamelize = require('decamelize');
import * as fs from 'fs';
import * as BPromise from 'bluebird';
//const Promise = require("bluebird");
import {buildUiSchema, normalizeSchema, readSwagger} from '../src/client/resapi';

const readFile = BPromise.promisify(fs.readFile);

test('decamelize', () => {
	expect(decamelize('fooBar', ' ')).toBe('foo bar');
	expect(decamelize('SSN', ' ')).toBe('ssn');
	expect(decamelize('yearlyRepayment', ' ')).toBe('yearly repayment');
});

interface File {
	name: string,
	content: string,
	json: object
}

interface SchemaData {
	normalized: File,
	uischema: File
}

interface Data {
	swagger: File,
	request: SchemaData,
	response: SchemaData
}

const allData: Map<string, Data> = {};

const fetch = (name: string): Promise<Data> => {
	if (allData[name]) {
		return Promise.resolve(allData[name]);
	}
	return Promise.all([
		readFile(`./test/data/${name}-swagger.json`),
		readFile(`./test/data/expected/${name}-request-normalized.json`),
		readFile(`./test/data/expected/${name}-request-uischema.json`),
		readFile(`./test/data/expected/${name}-response-normalized.json`),
		readFile(`./test/data/expected/${name}-response-uischema.json`)
	]).then(values => {
		return {
			swagger: {
				name: `${name}-swagger.json`,
				content: values[0].toString(),
				json: JSON.parse(values[0].toString())
			},
			request: {
				normalized: {
					name: `${name}-request-normalized.json`,
					content: values[1].toString(),
					json: JSON.parse(values[1].toString())
				},
				uischema: {
					name: `${name}-request-uischema.json`,
					content: values[2].toString(),
					json: JSON.parse(values[2].toString())
				}
			},
			response: {
				normalized: {
					name: `${name}-response-normalized.json`,
					content: values[3].toString(),
					json: JSON.parse(values[3].toString())
				},
				uischema: {
					name: `${name}-response-uischema.json`,
					content: values[4].toString(),
					json: JSON.parse(values[4].toString())
				}
			}
		}
	});
};

const testNormalize = (name) => {
	test(`testNormalize(${name})`, async () => {
		const data = await fetch(name);
		const { request, response } = readSwagger(data.swagger.json);
		normalizeSchema(request);
		expect(JSON.stringify(request, null, 2)).toBe(data.request.normalized.content);
		normalizeSchema(response);
		expect(JSON.stringify(response, null, 2)).toBe(data.response.normalized.content);
	});
};

const testBuildUISchema = (name) => {
	test(`testBuildUISchema(${name})`, async () => {
		const data = await fetch(name);
		const { request, response } = readSwagger(data.swagger.json);
		normalizeSchema(request);
		normalizeSchema(response);
		expect(JSON.stringify(buildUiSchema(request), null, 2)).toBe(data.request.uischema.content);
		expect(JSON.stringify(buildUiSchema(response), null, 2)).toBe(data.response.uischema.content);
	});
};

const runTest = name => {
	testNormalize(name);
	testBuildUISchema(name);
};

runTest('miniloan');

