const decamelize = require('decamelize');
import * as fs from 'fs';
import * as BPromise from 'bluebird';
import {buildUiSchema, normalizeSchema, readSwagger} from '../src/client/resapi';

const readFile = BPromise.promisify(fs.readFile);

// Set this to true in order to regenerate expected files
const overwrite = true;

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
	const files = [
		`./test/data/${name}-swagger.json`,
		`./test/data/expected/${name}-request-normalized.json`,
		`./test/data/expected/${name}-request-uischema.json`,
		`./test/data/expected/${name}-response-normalized.json`,
		`./test/data/expected/${name}-response-uischema.json`
	];
	return Promise.all(files.map((f, index) => {
		return (overwrite && index > 0) ? Promise.resolve("{}") : readFile(f);
	})).then(values => {
		const fill = index => ({
			name: files[index],
			content: values[index].toString(),
			json: JSON.parse(values[index].toString())
		});
		const data = {
			swagger: fill(0),
			request: {
				normalized: fill(1),
				uischema: fill(2)
			},
			response: {
				normalized: fill(3),
				uischema: fill(4)
			}
		};
		allData[name] = data;
		return data;
	});
};

const testNormalize = (name) => {
	test(`testNormalize(${name})`, async () => {
		const data = await fetch(name);
		const { request, response } = readSwagger(data.swagger.json);
		if (overwrite) {
			fs.writeFile(data.request.normalized.name, JSON.stringify(request, null, 2));
			fs.writeFile(data.response.normalized.name, JSON.stringify(response, null, 2));
		} else {
			expect(JSON.stringify(request, null, 2)).toBe(data.request.normalized.content);
			expect(JSON.stringify(response, null, 2)).toBe(data.response.normalized.content);
		}
	});
};

const testBuildUISchema = (name) => {
	test(`testBuildUISchema(${name})`, async () => {
		const data = await fetch(name);
		const { request, response } = readSwagger(data.swagger.json);
		if (overwrite) {
			fs.writeFile(data.request.uischema.name, JSON.stringify(buildUiSchema(request), null, 2));
			fs.writeFile(data.response.uischema.name, JSON.stringify(buildUiSchema(response), null, 2));
		} else {
			expect(JSON.stringify(buildUiSchema(request), null, 2)).toBe(data.request.uischema.content);
			expect(JSON.stringify(buildUiSchema(response), null, 2)).toBe(data.response.uischema.content);
		}
	});
};

const runTest = name => {
	testNormalize(name);
	testBuildUISchema(name);
};

runTest('miniloan');
runTest('carrental');
runTest('greetings');
runTest('indecisionairlines');
runTest('loanvalidation');
runTest('runner');

