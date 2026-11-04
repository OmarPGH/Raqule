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
	});

	it('matches js-tiktoken for a longer, multi-sentence piece of text', () => {
		const text = 'The quick brown fox jumps over the lazy dog. This sentence is used to test tokenizers.';
		const enc = getEncoding('o200k_base');
		const expected = enc.encode(text).length;

		assert.equal(countTokens(text), expected);
	});

	// Fixed fixtures: literal expected counts, computed once and hardcoded
	// here rather than recomputed from js-tiktoken at test time. The tests
	// above (which call getEncoding() live) prove countTokens is wired up
	// to tiktoken correctly; these prove the *actual numbers* don't quietly
	// drift — if a js-tiktoken upgrade, a BPE vocab change, or a bug in
	// countTokens ever shifted these counts, the runtime-comparison tests
	// above would still pass (since both sides would move together), but
	// these fixed-value tests would fail and flag it. Values below were
	// computed directly from js-tiktoken once; see the describe block for
	// how to regenerate them if they ever need to change deliberately.
	describe('fixed fixtures (regression values, independent of runtime encoding calls)', () => {
		// Regenerate with: node -e "import('js-tiktoken').then(({getEncoding}) => console.log(getEncoding('o200k_base').encode(TEXT).length))"
		const FIXTURES = [
			{ text: 'a', o200k_base: 1, cl100k_base: 1 },
			{ text: '12345', o200k_base: 2, cl100k_base: 2 },
			{ text: 'Hello, world!', o200k_base: 4, cl100k_base: 4 },
			{ text: 'The quick brown fox jumps over the lazy dog.', o200k_base: 10, cl100k_base: 10 },
		];

		for (const { text, o200k_base, cl100k_base } of FIXTURES) {
			it(`"${text}" is ${o200k_base} tokens under o200k_base`, () => {
				assert.equal(countTokens(text, 'o200k_base'), o200k_base);
			});

			it(`"${text}" is ${cl100k_base} tokens under cl100k_base`, () => {
				assert.equal(countTokens(text, 'cl100k_base'), cl100k_base);
			});
		}
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
