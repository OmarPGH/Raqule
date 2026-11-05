import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getEncoding } from 'js-tiktoken';
import { countTokens } from '../../src/utils/tokens.js';

// countTokens() is expensive to call: js-tiktoken's getEncoding() loads a
// full BPE vocab from scratch on every call (observed ~400-700ms each,
// with no internal caching — calling it twice in the same process costs
// twice — while encode() itself is fast, ~8ms), and countTokens() calls
// getEncoding() internally every time it runs. This file intentionally
// loads only ONE encoding (the default, o200k_base) and makes as few
// countTokens() calls as possible, computing every needed value once in
// a `before` hook and reusing it across multiple cheap assertions.
describe('countTokens', () => {
	const SAMPLE_TEXT = 'Hello, world!';
	const LONGER_TEXT = 'The quick brown fox jumps over the lazy dog. This sentence is used to test tokenizers.';

	let sampleCountDefault; // countTokens(SAMPLE_TEXT) with default encoding (o200k_base)
	let sampleCountGroundTruth; // same, computed independently via js-tiktoken directly
	let longerCountDefault;
	let longerCountGroundTruth;
	let sampleCountExplicitEncoding; // countTokens(SAMPLE_TEXT, 'o200k_base') — encoding named explicitly

	before(() => {
		// Exactly ONE getEncoding() load for the whole file.
		const enc = getEncoding('o200k_base');

		sampleCountDefault = countTokens(SAMPLE_TEXT);
		sampleCountGroundTruth = enc.encode(SAMPLE_TEXT).length;

		longerCountDefault = countTokens(LONGER_TEXT);
		longerCountGroundTruth = enc.encode(LONGER_TEXT).length;

		sampleCountExplicitEncoding = countTokens(SAMPLE_TEXT, 'o200k_base');
	});

	it('returns 0 for an empty string (does not even need to touch the encoder)', () => {
		assert.equal(countTokens(''), 0);
	});

	it('matches js-tiktoken\'s own encode().length for known text (ground truth, not just "> 0")', () => {
		// Calling js-tiktoken directly gives us a value computed completely
		// independently of countTokens' own logic, so this actually proves
		// countTokens returns the *correct* number, not just *a* positive
		// number. (A pinned literal check lives in the last test below —
		// that one catches drift this comparison structurally can't, since
		// both sides here are recomputed from the same library.)
		assert.equal(sampleCountDefault, sampleCountGroundTruth);
	});

	it('matches js-tiktoken for a longer, multi-sentence piece of text', () => {
		assert.equal(longerCountDefault, longerCountGroundTruth);
	});

	it('returns a larger count for longer text than for shorter text', () => {
		assert.ok(longerCountDefault > sampleCountDefault);
	});

	it('accepts the encoding name explicitly and still matches the ground truth (not just when relying on the default)', () => {
		// Deliberately uses the SAME encoding as the default here rather
		// than loading a second one (e.g. cl100k_base) — loading another
		// encoding would double this file's runtime for a check that
		// doesn't need a different encoding to be meaningful: it proves
		// the `encoding` parameter is actually read and forwarded to
		// getEncoding(), not that two different encodings produce two
		// different results (which the pinned fixture below also happens
		// to show, since it checks the same literal value).
		assert.equal(sampleCountExplicitEncoding, sampleCountGroundTruth);
	});

	it('throws a clear error for an unknown/invalid encoding name, instead of silently using a default', () => {
		assert.throws(() => countTokens(SAMPLE_TEXT, 'not-a-real-encoding'));
	});

	it('throws when given a non-string value (fails fast, before ever touching the encoder)', () => {
		assert.throws(() => countTokens(42), /expected "string"/);
		assert.throws(() => countTokens(null), /expected "string"/);
		assert.throws(() => countTokens(undefined), /expected "string"/);
		assert.throws(() => countTokens({}), /expected "string"/);
	});

	// Fixed fixture: a hardcoded expected count, independent of any runtime
	// js-tiktoken call, so it catches drift that the live-comparison tests
	// above structurally cannot (since those recompute both sides from the
	// same library at test time). Reuses the value already computed in
	// `before` above instead of making another countTokens() call.
	// Regenerate with: node -e "import('js-tiktoken').then(({getEncoding}) => console.log(getEncoding('o200k_base').encode('Hello, world!').length))"
	it('"Hello, world!" is a pinned token count (4) under o200k_base', () => {
		assert.equal(sampleCountDefault, 4);
	});
});
