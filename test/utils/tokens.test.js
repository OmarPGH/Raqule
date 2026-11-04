import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getEncoding } from 'js-tiktoken';
import { countTokens } from '../../src/utils/tokens.js';

describe('countTokens', () => {
	it('returns 0 for an empty string', () => {
		assert.equal(countTokens(''), 0);
	});

	it('matches js-tiktoken\'s own encode().length for known text (ground truth, not just "> 0")', () => {
		// Calling js-tiktoken directly gives us a value computed completely
		// independently of countTokens' own logic, so this actually proves
		// countTokens returns the *correct* number, not just *a* positive
		// number. "Hello, world!" is a single BPE-friendly sentence that's
		// stable across tiktoken encodings.
		const enc = getEncoding('o200k_base');
		const expected = enc.encode('Hello, world!').length;

		assert.equal(countTokens('Hello, world!'), expected);
		assert.equal(countTokens('Hello, world!'), 4);
	});

	it('matches js-tiktoken for a longer, multi-sentence piece of text', () => {
		const text = 'The quick brown fox jumps over the lazy dog. This sentence is used to test tokenizers.';
		const enc = getEncoding('o200k_base');
		const expected = enc.encode(text).length;

		assert.equal(countTokens(text), expected);
	});

	it('returns a larger count for longer text than for shorter text', () => {
		const shortCount = countTokens('Hello');
		const longCount = countTokens('Hello, this is a much longer sentence with many more tokens in it.');

		assert.ok(longCount > shortCount);
	});

	it('respects an explicit encoding argument, matching that encoding\'s own output', () => {
		const text = 'Hello, world!';
		const cl100k = getEncoding('cl100k_base');

		assert.equal(countTokens(text, 'cl100k_base'), cl100k.encode(text).length);
	});

	it('throws a clear error for an unknown/invalid encoding name, instead of silently using a default', () => {
		assert.throws(() => countTokens('Hello, world!', 'not-a-real-encoding'));
	});

	it('throws when given a non-string value', () => {
		assert.throws(() => countTokens(42), /expected "string"/);
		assert.throws(() => countTokens(null), /expected "string"/);
		assert.throws(() => countTokens(undefined), /expected "string"/);
		assert.throws(() => countTokens({}), /expected "string"/);
	});
});
