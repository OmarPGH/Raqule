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

	it('the returned handler returns an empty string for empty content', () => {
		const handler = specialFileHandler('LICENSE');
		assert.equal(handler(''), '');
	});

	// --------------------------------------------------------------------
	// Characterization tests: known limitations of the CURRENT implementation
	// --------------------------------------------------------------------
	// Everything in this block documents what specialFiles.js actually does
	// today — it is NOT a statement of intended/ideal behavior. These are
	// regression guards, not a spec: if any of these are deliberately fixed
	// later, the corresponding test below must be flipped to expect the new
	// (correct) behavior, not left as-is. They exist so that if the
	// underlying implementation changes shape unintentionally (e.g. during
	// an unrelated refactor), these edge cases get flagged instead of
	// silently changing behavior. None of these are asserted to be the
	// "right" behavior for the product — see PR discussion for the product
	// decision on whether/how to fix them.
	describe('known limitations (NOT intended behavior — see note above)', () => {
		it('does NOT currently match an uppercase extension like "LICENSE.MD" (extension check is case-sensitive, unlike the base name check)', () => {
			assert.equal(specialFileHandler('LICENSE.MD'), undefined);
			assert.equal(specialFileHandler('LICENSE.TXT'), undefined);
		});

		it('does NOT currently match a filename with more than one dot, like "LICENSE.en.md" (fileName.split(\'.\') only inspects parts[1] as "the extension")', () => {
			assert.equal(specialFileHandler('LICENSE.en.md'), undefined);
		});

		it('the returned handler does NOT currently normalize CRLF line endings — a trailing "\\r" survives on every kept line but the last', () => {
			const handler = specialFileHandler('LICENSE');
			const content = 'line1\r\nline2\r\nline3\r\nline4';

			assert.equal(handler(content), 'line1\r\nline2\r\nline3\r');
		});
	});
});
