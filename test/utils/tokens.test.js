import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { countTokens } from '../../src/utils/tokens.js';

describe('countTokens', () => {
	it('returns 0 for an empty string', () => {
		assert.equal(countTokens(''), 0);
	});

	it('returns a positive token count for a normal piece of text', () => {
		const count = countTokens('Hello, world!');
		assert.ok(count > 0);
		assert.equal(typeof count, 'number');
	});

	it('returns a larger count for longer text than for shorter text', () => {
		const shortCount = countTokens('Hello');
		const longCount = countTokens('Hello, this is a much longer sentence with many more tokens in it.');

		assert.ok(longCount > shortCount);
	});

	it('accepts an explicit encoding argument', () => {
		const count = countTokens('Hello, world!', 'o200k_base');
		assert.ok(count > 0);
	});

	it('throws when given a non-string value', () => {
		assert.throws(() => countTokens(42), /expected "string"/);
		assert.throws(() => countTokens(null), /expected "string"/);
		assert.throws(() => countTokens(undefined), /expected "string"/);
		assert.throws(() => countTokens({}), /expected "string"/);
	});
});
