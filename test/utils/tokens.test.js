import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { countTokens } from '../../src/utils/tokens.js';

// Every successful countTokens() call reloads the whole vocabulary (~400-700ms), so the file makes only two.
describe('countTokens', () => {
	// cl100k_base counts 37 tokens for this text, so a wrong default encoding fails the exact count.
	const TEXT = 'Hello, world!\nThe quick brown fox 🦊 jumps over the lazy dog.\nمرحبا بالعالم، هذا اختبار.';
	const TEXT_TOKEN_COUNT = 25;

	let countWithDefaultEncoding;
	let countWithExplicitEncoding;

	before(() => {
		countWithDefaultEncoding = countTokens(TEXT);
		countWithExplicitEncoding = countTokens(TEXT, 'o200k_base');
	});

	it('returns 0 for an empty string', () => {
		assert.equal(countTokens(''), 0);
	});

	it('counts the exact number of o200k_base tokens of a multi-line text with an emoji and Arabic', () => {
		assert.equal(countWithDefaultEncoding, TEXT_TOKEN_COUNT);
	});

	it('counts the same tokens when o200k_base is passed explicitly as when it is left out', () => {
		assert.equal(countWithExplicitEncoding, countWithDefaultEncoding);
	});

	it('throws when the encoding name is unknown', () => {
		assert.throws(() => countTokens(TEXT, 'not-a-real-encoding'));
	});

	it('throws when given a non-string value', () => {
		assert.throws(() => countTokens(42), /expected "string"/);
		assert.throws(() => countTokens(null), /expected "string"/);
		assert.throws(() => countTokens(undefined), /expected "string"/);
		assert.throws(() => countTokens({}), /expected "string"/);
	});
});
