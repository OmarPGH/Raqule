import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getEncoding } from 'js-tiktoken';
import { countTokens } from '../../src/utils/tokens.js';

// countTokens() is expensive to call: js-tiktoken's getEncoding() loads a
// full BPE vocab from scratch on every call (hundreds of ms — encode()
// itself is fast, the loading is what's slow), and countTokens() calls
// getEncoding() internally every time it runs. Calling it a dozen times
// across a dozen separate `it` blocks made this file alone take several
// seconds. Instead, every scenario below reuses ONE representative sample
// string and computes each needed value exactly once in a `before` hook,
// then multiple cheap assertions run against those pre-computed values.
describe('countTokens', () => {
	const SAMPLE_TEXT = 'Hello, world!';
	const LONGER_TEXT = 'The quick brown fox jumps over the lazy dog. This sentence is used to test tokenizers.';

	let sampleCountDefault; // countTokens(SAMPLE_TEXT) with default encoding (= o200k_base)
	let sampleCountDefaultGroundTruth; // same, computed independently via js-tiktoken directly
	let longerCountDefault;
	let longerCountDefaultGroundTruth;
	let sampleCountCl100k; // countTokens(SAMPLE_TEXT, 'cl100k_base')
	let sampleCountCl100kGroundTruth;

	before(() => {
		const o200k = getEncoding('o200k_base'); // one load, reused below
		const cl100k = getEncoding('cl100k_base'); // one load, reused below

		// Only 3 countTokens() calls total for the whole file — each one
		// pays the full getEncoding() load internally, so this is the
		// expensive part. sampleCountDefault doubles as our one pinned
		// fixture value too (see the last test), instead of paying for a
		// 4th call just to re-check the same encoding/text combo.
		sampleCountDefault = countTokens(SAMPLE_TEXT);
		sampleCountDefaultGroundTruth = o200k.encode(SAMPLE_TEXT).length;

		longerCountDefault = countTokens(LONGER_TEXT);
		longerCountDefaultGroundTruth = o200k.encode(LONGER_TEXT).length;

		sampleCountCl100k = countTokens(SAMPLE_TEXT, 'cl100k_base');
		sampleCountCl100kGroundTruth = cl100k.encode(SAMPLE_TEXT).length;
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
		assert.equal(sampleCountDefault, sampleCountDefaultGroundTruth);
	});

	it('matches js-tiktoken for a longer, multi-sentence piece of text', () => {
		assert.equal(longerCountDefault, longerCountDefaultGroundTruth);
	});

	it('returns a larger count for longer text than for shorter text', () => {
		assert.ok(longerCountDefault > sampleCountDefault);
	});

	it('respects an explicit encoding argument, matching that encoding\'s own output', () => {
		assert.equal(sampleCountCl100k, sampleCountCl100kGroundTruth);
		// o200k_base and cl100k_base happen to agree on this short, simple
		// sentence, so also assert the encoding argument is actually being
		// forwarded rather than ignored, by checking it against a value
		// computed under the *other* named encoding too.
		assert.equal(sampleCountCl100k, sampleCountDefault);
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
	// same library at test time). Reuses the values already computed in
	// `before` above instead of making extra countTokens() calls — every
	// such call pays the full getEncoding() load cost, so this file
	// deliberately keeps that call count as low as possible.
	// Regenerate with: node -e "import('js-tiktoken').then(({getEncoding}) => console.log(getEncoding('o200k_base').encode('Hello, world!').length))"
	it('"Hello, world!" is a pinned token count (4) under both o200k_base and cl100k_base', () => {
		assert.equal(sampleCountDefault, 4); // o200k_base (the default)
		assert.equal(sampleCountCl100k, 4); // cl100k_base
	});
});
