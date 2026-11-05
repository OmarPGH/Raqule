import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateDirectory } from '../../src/validation/directory.js';

describe('validateDirectory', () => {
	let tmpDir;

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'raqule-test-'));
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	it('resolves with the given path when it is an existing directory', async () => {
		const result = await validateDirectory(tmpDir);
		assert.equal(result, tmpDir);
	});

	it('rejects (does not resolve) when the path does not exist', async () => {
		const missingPath = path.join(tmpDir, 'does-not-exist');
		await assert.rejects(() => validateDirectory(missingPath));
	});

	it('rejects (does not resolve) when the path exists but is a file, not a directory', async () => {
		const filePath = path.join(tmpDir, 'file.txt');
		fs.writeFileSync(filePath, 'hello');
		await assert.rejects(() => validateDirectory(filePath));
	});

	it('rejects with a real Error instance in every failure case, not a raw string/code', async () => {
		const missingPath = path.join(tmpDir, 'does-not-exist');
		const filePath = path.join(tmpDir, 'file.txt');
		fs.writeFileSync(filePath, 'hello');

		await assert.rejects(() => validateDirectory(missingPath), (err) => err instanceof Error);
		await assert.rejects(() => validateDirectory(filePath), (err) => err instanceof Error);
	});

	it('treats "missing path" and "path is a file" as distinguishable failure cases', async () => {
		// Regardless of wording, a caller must be able to tell these two
		// situations apart (e.g. to suggest "did you mean a different path?"
		// vs "that's a file, pick its containing folder"). We check this
		// behaviorally, not by matching text: the two errors must not be
		// interchangeable/equal, and each must stay specific to its own
		// case instead of being reused for both.
		const missingPath = path.join(tmpDir, 'does-not-exist');
		const filePath = path.join(tmpDir, 'file.txt');
		fs.writeFileSync(filePath, 'hello');

		const missingErr = await validateDirectory(missingPath).catch((e) => e);
		const fileErr = await validateDirectory(filePath).catch((e) => e);

		assert.notEqual(missingErr.message, fileErr.message);
	});

	it('does not swallow or reinterpret an unrelated filesystem error (e.g. permission denied) as "not found"', async () => {
		const originalStat = fs.promises.stat;
		const permissionError = Object.assign(new Error('simulated EACCES'), { code: 'EACCES' });
		fs.promises.stat = async () => {
			throw permissionError;
		};

		try {
			// The function must propagate this exact error object rather
			// than catching it and manufacturing its own "not found"
			// message (which would mislead the caller about the real cause).
			await assert.rejects(() => validateDirectory(tmpDir), (err) => err === permissionError);
		} finally {
			fs.promises.stat = originalStat;
		}
	});

	it('resolving does not depend on trailing slashes in the given path', async () => {
		const withTrailingSlash = tmpDir.endsWith(path.sep) ? tmpDir : tmpDir + path.sep;
		const result = await validateDirectory(withTrailingSlash);
		assert.equal(result, withTrailingSlash);
	});
});
