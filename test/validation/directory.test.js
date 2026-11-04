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

	it('rejects with a helpful message when the path does not exist', async () => {
		const missingPath = path.join(tmpDir, 'does-not-exist');

		await assert.rejects(
			() => validateDirectory(missingPath),
			(err) => {
				assert.ok(err instanceof Error);
				assert.ok(err.message.includes('Directory not found'));
				assert.ok(err.message.includes(missingPath));
				return true;
			}
		);
	});

	it('rejects with a helpful message when the path exists but is a file, not a directory', async () => {
		const filePath = path.join(tmpDir, 'file.txt');
		fs.writeFileSync(filePath, 'hello');

		await assert.rejects(
			() => validateDirectory(filePath),
			(err) => {
				assert.ok(err instanceof Error);
				assert.ok(err.message.includes("exists but isn't a directory"));
				assert.ok(err.message.includes(filePath));
				return true;
			}
		);
	});
});
