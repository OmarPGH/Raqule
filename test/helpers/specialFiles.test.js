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

	it("the returned handler truncates content to the first 3 lines", () => {
		const handler = specialFileHandler('LICENSE');
		const content = 'line1\nline2\nline3\nline4\nline5';

		assert.equal(handler(content), 'line1\nline2\nline3');
	});

	it('the returned handler returns all content as-is when there are 3 or fewer lines', () => {
		const handler = specialFileHandler('LICENSE.md');
		const content = 'only one line';

		assert.equal(handler(content), 'only one line');
	});
});
