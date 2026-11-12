import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatConfigErrors } from '../../src/config/formatConfigErrors.js';

function buildError(issues) {
	return { issues };
}

function buildIssue({ path, message, expected }) {
	return { path, message, expected };
}

describe('formatConfigErrors', () => {
	it('starts with the "Config error at:" title', () => {
		const error = buildError([
			buildIssue({ path: ['ignore'], message: 'Invalid input: expected array, received string', expected: 'array' }),
		]);

		const result = formatConfigErrors(error);

		assert.ok(result.startsWith('Config error at:'));
	});

	it('shows the path, the found value and the expected type of one issue', () => {
		const error = buildError([
			buildIssue({ path: ['ignore'], message: 'Invalid input: expected array, received string', expected: 'array' }),
		]);

		const result = formatConfigErrors(error);

		assert.equal(
			result,
			'Config error at:\n\n  1. [ignore]\n     Found: string\n     Expected: array',
		);
	});

	it('joins a nested path with dots', () => {
		const error = buildError([
			buildIssue({ path: ['ignore', 2], message: 'Invalid input: expected string, received number', expected: 'string' }),
		]);

		const result = formatConfigErrors(error);

		assert.match(result, /1\. \[ignore\.2\]/);
	});

	it('shows empty brackets when the issue has no path', () => {
		const error = buildError([
			buildIssue({ path: [], message: 'Invalid input: expected object, received null', expected: 'object' }),
		]);

		const result = formatConfigErrors(error);

		assert.match(result, /1\. \[\]/);
	});

	it('numbers several issues in order', () => {
		const error = buildError([
			buildIssue({ path: ['ignore', 0], message: 'Invalid input: expected string, received number', expected: 'string' }),
			buildIssue({ path: ['ignore', 1], message: 'Invalid input: expected string, received boolean', expected: 'string' }),
		]);

		const result = formatConfigErrors(error);

		assert.match(result, /1\. \[ignore\.0\][\s\S]*2\. \[ignore\.1\]/);
	});

	it('reports each issue with its own found value', () => {
		const error = buildError([
			buildIssue({ path: ['ignore', 0], message: 'Invalid input: expected string, received number', expected: 'string' }),
			buildIssue({ path: ['ignore', 1], message: 'Invalid input: expected string, received boolean', expected: 'string' }),
		]);

		const result = formatConfigErrors(error);

		assert.match(result, /Found: number/);
		assert.match(result, /Found: boolean/);
	});

	it('returns only the title when there are no issues', () => {
		const result = formatConfigErrors(buildError([]));

		assert.equal(result, 'Config error at:');
	});
});
