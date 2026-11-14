import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getEncoding } from 'js-tiktoken';
import { countTokens } from '../../src/utils/tokens.js';

// getEncoding() reloads the whole vocabulary on every call (~400-700ms), so it runs once in `before`.
describe('countTokens', () => {
	const SAMPLE_TEXT = 'Hello, world!';
	const LONGER_TEXT = 'The quick brown fox jumps over the lazy dog. This sentence is used to test tokenizers.';

	let sampleCountDefault;
	let sampleCountGroundTruth;
	let longerCountDefault;
	let longerCountGroundTruth;
	let sampleCountExplicitEncoding;

	before(() => {
		const enc = getEncoding('o200k_base');

		sampleCountDefault = countTokens(SAMPLE_TEXT);
		sampleCountGroundTruth = enc.encode(SAMPLE_TEXT).length;

		longerCountDefault = countTokens(LONGER_TEXT);
		longerCountGroundTruth = enc.encode(LONGER_TEXT).length;

		sampleCountExplicitEncoding = countTokens(SAMPLE_TEXT, 'o200k_base');
	});

	it('returns 0 for an empty string', () => {
		assert.equal(countTokens(''), 0);
	});

	it('counts the same tokens as js-tiktoken for a short text', () => {
		assert.equal(sampleCountDefault, sampleCountGroundTruth);
	});

	it('counts the same tokens as js-tiktoken for a longer, multi-sentence text', () => {
		assert.equal(longerCountDefault, longerCountGroundTruth);
	});

	it('returns a larger count for longer text than for shorter text', () => {
		assert.ok(longerCountDefault > sampleCountDefault);
	});

	it('counts the same tokens as js-tiktoken when the encoding name is passed explicitly', () => {
		assert.equal(sampleCountExplicitEncoding, sampleCountGroundTruth);
	});

	it('throws when the encoding name is unknown', () => {
		assert.throws(() => countTokens(SAMPLE_TEXT, 'not-a-real-encoding'));
	});

	it('throws when given a non-string value', () => {
		assert.throws(() => countTokens(42), /expected "string"/);
		assert.throws(() => countTokens(null), /expected "string"/);
		assert.throws(() => countTokens(undefined), /expected "string"/);
		assert.throws(() => countTokens({}), /expected "string"/);
	});

	// Pinned value: the comparisons above compute both sides with the same library, so they cannot catch drift.
	it('counts "Hello, world!" as exactly 4 tokens under o200k_base', () => {
		assert.equal(sampleCountDefault, 4);
	});
});
