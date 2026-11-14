import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { specialFileHandler } from '../../src/helpers/specialFiles.js';

describe('specialFileHandler', () => {
	it('returns a handler for a bare "LICENSE" file', () => {
		const handler = specialFileHandler('LICENSE');

		assert.equal(typeof handler, 'function');
	});

	it('returns a handler for "LICENSE.md" and "LICENSE.txt"', () => {
		assert.equal(typeof specialFileHandler('LICENSE.md'), 'function');
		assert.equal(typeof specialFileHandler('LICENSE.txt'), 'function');
	});

	it('matches the base name case-insensitively', () => {
		assert.equal(typeof specialFileHandler('license'), 'function');
		assert.equal(typeof specialFileHandler('License.md'), 'function');
		assert.equal(typeof specialFileHandler('LICENSE.txt'), 'function');
	});

	it('returns undefined for an unrelated file', () => {
		assert.equal(specialFileHandler('index.js'), undefined);
		assert.equal(specialFileHandler('README.md'), undefined);
	});

	it('returns undefined when the base name is "license" but the extension is unsupported', () => {
		assert.equal(specialFileHandler('LICENSE.json'), undefined);
	});

	it('returns undefined for a completely empty filename', () => {
		assert.equal(specialFileHandler(''), undefined);
	});

	it('returns a handler that truncates content to the first 3 lines', () => {
		const handler = specialFileHandler('LICENSE');
		const content = 'line1\nline2\nline3\nline4\nline5';
		const expected = 'line1\nline2\nline3';

		assert.equal(handler(content), expected);
	});

	it('returns a handler that keeps content as-is when it has 3 or fewer lines', () => {
		const handler = specialFileHandler('LICENSE.md');
		const content = 'only one line';

		assert.equal(handler(content), content);
	});

	it('returns a handler that returns an empty string for empty content', () => {
		const handler = specialFileHandler('LICENSE');
		const content = '';

		assert.equal(handler(content), content);
	});
});
