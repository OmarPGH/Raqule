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

	// NOTE: this documents a real limitation in the current implementation,
	// rather than the ideal behavior. specialFiles.js only lowercases the
	// base name, not the extension (`['', 'md', 'txt'].includes(extension)`
	// is a case-sensitive check), so an uppercase extension like "LICENSE.MD"
	// is *not* recognized today even though "LICENSE.md" is. If that gets
	// fixed, this test should flip to expecting a handler function.
	it('does NOT currently match an uppercase extension like "LICENSE.MD" (case-sensitive extension check)', () => {
		assert.equal(specialFileHandler('LICENSE.MD'), undefined);
		assert.equal(specialFileHandler('LICENSE.TXT'), undefined);
	});

	// NOTE: also documents a real limitation. fileName.split('.') takes
	// parts[1] as "the extension", so for a name with more than one dot
	// (e.g. a localized license file), the real extension ends up ignored
	// and the middle segment is checked instead — so this is not detected
	// as a LICENSE file even though a human would recognize it as one.
	it('does NOT currently match a filename with more than one dot, like "LICENSE.en.md"', () => {
		assert.equal(specialFileHandler('LICENSE.en.md'), undefined);
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

	// NOTE: documents a real limitation. The handler splits on '\n' only,
	// so on Windows-style CRLF content each kept line (other than the
	// last) retains a trailing '\r'. A caller comparing this output
	// against a clean "line3" would see "line3\r" instead.
	it('the returned handler leaves a trailing "\\r" on CRLF content (does not normalize line endings)', () => {
		const handler = specialFileHandler('LICENSE');
		const content = 'line1\r\nline2\r\nline3\r\nline4';

		assert.equal(handler(content), 'line1\r\nline2\r\nline3\r');
	});
});
