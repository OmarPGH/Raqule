import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateDirectory } from '../../src/validation/directory.js';
import { createTempProject, removeTempProject } from '../support/tempProject.js';

describe('validateDirectory', () => {
	let tmpDir;
	let filePath;
	let missingPath;

	beforeEach(() => {
		tmpDir = createTempProject({ 'file.txt': 'hello' });
		filePath = path.join(tmpDir, 'file.txt');
		missingPath = path.join(tmpDir, 'does-not-exist');
	});

	afterEach(() => removeTempProject(tmpDir));

	it('resolves with the given path when it is an existing directory', async () => {
		const result = await validateDirectory(tmpDir);

		assert.equal(result, tmpDir);
	});

	it('rejects when the path does not exist', async () => {
		await assert.rejects(() => validateDirectory(missingPath));
	});

	it('rejects when the path is a file, not a directory', async () => {
		await assert.rejects(() => validateDirectory(filePath));
	});

	it('rejects with an Error instance, not a raw string or code, in every failure case', async () => {
		await assert.rejects(() => validateDirectory(missingPath), (err) => err instanceof Error);
		await assert.rejects(() => validateDirectory(filePath), (err) => err instanceof Error);
	});

	it('rejects with a different message for a missing path than for a path that is a file', async () => {
		// Callers suggest a different fix for each case, so the errors must not be interchangeable.
		const missingErr = await validateDirectory(missingPath).catch((e) => e);
		const fileErr = await validateDirectory(filePath).catch((e) => e);

		assert.notEqual(missingErr.message, fileErr.message);
	});

	it('rejects with the original error when the filesystem fails for another reason such as permission denied', async () => {
		const originalStat = fs.promises.stat;
		const permissionError = Object.assign(new Error('simulated EACCES'), { code: 'EACCES' });
		fs.promises.stat = async () => {
			throw permissionError;
		};

		try {
			// Rewrapping it as "not found" would hide the real cause from the caller.
			await assert.rejects(() => validateDirectory(tmpDir), (err) => err === permissionError);
		} finally {
			fs.promises.stat = originalStat;
		}
	});

	it('resolves with the given path unchanged when it ends with a trailing slash', async () => {
		const withTrailingSlash = tmpDir.endsWith(path.sep) ? tmpDir : tmpDir + path.sep;

		const result = await validateDirectory(withTrailingSlash);

		assert.equal(result, withTrailingSlash);
	});
});
