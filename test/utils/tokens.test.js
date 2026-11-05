import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getEncoding } from 'js-tiktoken';
import { countTokens } from '../../src/utils/tokens.js';

// getEncoding() reloads its full BPE vocab on every call (~400-700ms, no
// internal caching), so this file loads it once in `before`, computes
// every needed value, and reuses them across cheap assertions below.
describe('countTokens', () => {
	const SAMPLE_TEXT = 'Hello, world!';
	const LONGER_TEXT = 'The quick brown fox jumps over the lazy dog. This sentence is used to test tokenizers.';

	let sampleCountDefault;
	let sampleCountGroundTruth;
	let longerCountDefault;
	let longerCountGroundTruth;
	let sampleCountExplicitEncoding;

	before(() => {
		const enc = getEncoding('o200k_base'); // one load for the whole file

		sampleCountDefault = countTokens(SAMPLE_TEXT);
		sampleCountGroundTruth = enc.encode(SAMPLE_TEXT).length;

		longerCountDefault = countTokens(LONGER_TEXT);
		longerCountGroundTruth = enc.encode(LONGER_TEXT).length;

		sampleCountExplicitEncoding = countTokens(SAMPLE_TEXT, 'o200k_base');
	});

	it('returns 0 for an empty string', () => {
		assert.equal(countTokens(''), 0);
	});

	it('matches js-tiktoken\'s own encode().length (ground truth, not just "> 0")', () => {
		assert.equal(sampleCountDefault, sampleCountGroundTruth);
	});

	it('matches js-tiktoken for a longer, multi-sentence piece of text', () => {
		assert.equal(longerCountDefault, longerCountGroundTruth);
	});

	it('returns a larger count for longer text than for shorter text', () => {
		assert.ok(longerCountDefault > sampleCountDefault);
	});

	it('accepts the encoding name explicitly and still matches the ground truth', () => {
		assert.equal(sampleCountExplicitEncoding, sampleCountGroundTruth);
	});

	it('throws a clear error for an unknown/invalid encoding name', () => {
		assert.throws(() => countTokens(SAMPLE_TEXT, 'not-a-real-encoding'));
	});

	it('throws when given a non-string value', () => {
		assert.throws(() => countTokens(42), /expected "string"/);
		assert.throws(() => countTokens(null), /expected "string"/);
		assert.throws(() => countTokens(undefined), /expected "string"/);
		assert.throws(() => countTokens({}), /expected "string"/);
	});

	// Pinned fixture, independent of any runtime js-tiktoken call — catches
	// drift the live-comparison tests above can't, since those recompute
	// both sides from the same library at test time.
	it('"Hello, world!" is a pinned token count (4) under o200k_base', () => {
		assert.equal(sampleCountDefault, 4);
	});
});
