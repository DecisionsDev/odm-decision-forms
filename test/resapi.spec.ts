import {DateFormat, Options} from "../src/client/state";

const decamelize = require('decamelize');
import * as fs from 'fs';
import * as BPromise from 'bluebird';
import {buildUiSchema, readSwagger, normalizePayload} from '../src/client/resapi';

const readFile = BPromise.promisify(fs.readFile);

// Set this to true in order to regenerate expected files (if true, tests will fail at the end, which is expected)
const overwrite = false;

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

const defaultOptions : Options = {
	liveValidation: true,
	dateFormat: DateFormat.Widget
};

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
		const options: Options = {
			liveValidation: true,
			dateFormat: DateFormat.Widget
		};
		const { request, response } = readSwagger(data.swagger.json, options);
		if (overwrite) {
			fs.writeFile(data.request.normalized.name, JSON.stringify(request, null, 2));
			fs.writeFile(data.response.normalized.name, JSON.stringify(response, null, 2));
		} else {
			expect(JSON.stringify(request, null, 2)).toBe(data.request.normalized.content);
			expect(JSON.stringify(response, null, 2)).toBe(data.response.normalized.content);
		}
	});
};

const testNormalizeResponse = () => {
	test(`testNormalizeResponse()`, async () => {
		const data = await fetch('loanvalidation');
		const { request, response } = readSwagger(data.swagger.json);
		const input = {
			"Borrower": {
				"firstName": "John",
				"lastName": "Doe",
				"birthDate": "2000-01-01T11:34:00.000Z",
				"yearlyIncome": 50000,
				"zipCode": "92000",
				"creditScore": 300,
				"latestBankruptcy": {},
				"SSN": {
					"areaNumber": "123",
					"groupCode": "12",
					"serialNumber": "1234"
				},
				"spouse": "{\n" +
				"\t\t\t\"firstName\": \"Jane\",\n" +
				"\t\t\t\"lastName\": \"Doe\",\n" +
				"\t\t\t\"creditScore\": 400\n" +
				"\t\t}"
			},
			"Loan": {
				"numberOfMonthlyPayments": 300,
				"startDate": "2018-01-01T11:02:00.000Z",
				"amount": 10000
			},
			"current_time": "2017-12-20T10:00:00.000Z"
		};
		const normalizedInput = normalizePayload(request, input);
		expect(typeof input.Borrower.spouse).toBe("string");
		expect(typeof normalizedInput.Borrower.spouse).toBe("object");
		expect(normalizedInput.Borrower.spouse.firstName).toBe("Jane");
		expect(normalizedInput.Borrower.spouse.lastName).toBe("Doe");
		expect(normalizedInput.Borrower.spouse.creditScore).toBe(400);
		// Compare expected and actual without spouse field
		delete normalizedInput.Borrower.spouse;
		delete input.Borrower.spouse;
		expect(JSON.stringify(normalizedInput)).toBe(JSON.stringify(input));
	});
};

const testBuildUISchema = (name) => {
	test(`testBuildUISchema(${name})`, async () => {
		const data = await fetch(name);
		const { request, response } = readSwagger(data.swagger.json);
		if (overwrite) {
			fs.writeFile(data.request.uischema.name, JSON.stringify(buildUiSchema(request, defaultOptions), null, 2));
			fs.writeFile(data.response.uischema.name, JSON.stringify(buildUiSchema(response, defaultOptions), null, 2));
		} else {
			expect(JSON.stringify(buildUiSchema(request, defaultOptions), null, 2)).toBe(data.request.uischema.content);
			expect(JSON.stringify(buildUiSchema(response, defaultOptions), null, 2)).toBe(data.response.uischema.content);
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
runTest('br4bxfilter');
runTest('testmodel');
testNormalizeResponse();

test('Verifying overwrite is false', () => {
	// Reminder: fail at the end as lon as overwrite is true
	expect(overwrite).toBe(false);
});