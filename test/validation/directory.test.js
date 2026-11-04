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

	it('rejects when the path does not exist, and the error names the missing path', async () => {
		const missingPath = path.join(tmpDir, 'does-not-exist');

		await assert.rejects(
			() => validateDirectory(missingPath),
			(err) => {
				assert.ok(err instanceof Error);
				// Don't pin the exact wording — only that the error is
				// actually about *this* path, so the message is useful.
				assert.ok(err.message.includes(missingPath));
				return true;
			}
		);
	});

	it('rejects when the path exists but is a file, not a directory, and the error names that path', async () => {
		const filePath = path.join(tmpDir, 'file.txt');
		fs.writeFileSync(filePath, 'hello');

		await assert.rejects(
			() => validateDirectory(filePath),
			(err) => {
				assert.ok(err instanceof Error);
				assert.ok(err.message.includes(filePath));
				return true;
			}
		);
	});

	it('produces different errors for "missing path" vs "path is a file" so callers can tell them apart', async () => {
		const missingPath = path.join(tmpDir, 'does-not-exist');
		const filePath = path.join(tmpDir, 'file.txt');
		fs.writeFileSync(filePath, 'hello');

		let missingErr;
		let fileErr;

		try {
			await validateDirectory(missingPath);
		} catch (err) {
			missingErr = err;
		}

		try {
			await validateDirectory(filePath);
		} catch (err) {
			fileErr = err;
		}

		assert.ok(missingErr instanceof Error);
		assert.ok(fileErr instanceof Error);
		assert.notEqual(missingErr.message, fileErr.message);
	});

	it('propagates an unexpected filesystem error (e.g. permission denied) instead of swallowing it', async () => {
		// Simulate any fs error other than ENOENT (e.g. EACCES) and make sure
		// validateDirectory doesn't reinterpret it as "not found".
		const originalStat = fs.promises.stat;
		const permissionError = Object.assign(new Error('permission denied'), { code: 'EACCES' });
		fs.promises.stat = async () => {
			throw permissionError;
		};

		try {
			await assert.rejects(
				() => validateDirectory(tmpDir),
				(err) => {
					assert.equal(err, permissionError);
					return true;
				}
			);
		} finally {
			fs.promises.stat = originalStat;
		}
	});
});
