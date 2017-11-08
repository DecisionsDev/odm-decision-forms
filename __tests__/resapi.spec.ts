const decamelize = require('decamelize');
import * as fs from 'fs';
import * as Promise from 'bluebird';
//const Promise = require("bluebird");
import { normalizeSchema } from '../app/resapi';

const readFile = Promise.promisify(fs.readFile);

test('decamelize', () => {
  expect(decamelize('fooBar', ' ')).toBe('foo bar');
  expect(decamelize('SSN', ' ')).toBe('ssn');
  expect(decamelize('yearlyRepayment', ' ')).toBe('yearly repayment');
});

const testNormalize = (schemaName) => {
	return Promise.all([
		readFile(`./__tests__/data/${schemaName}.json`),
		readFile(`./__tests__/data/${schemaName}-normalized.json`)
	]).then(values => {
		const source = JSON.parse(values[0].toString());
		normalizeSchema(source);
		const expectedTarget = values[1].toString();
		return expect(JSON.stringify(source, null, 2)).toBe(expectedTarget);
	});
};

test('normalizeSchema(miniloan-request)', () => testNormalize('miniloan-request'));
test('normalizeSchema(miniloan-response)', () => testNormalize('miniloan-response'));


