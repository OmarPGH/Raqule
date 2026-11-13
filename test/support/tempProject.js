import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const baseFlags = { depth: Infinity };

// Creating symlinks on Windows needs elevated privileges.
export const symlinkTestOptions = { skip: process.platform === 'win32' };

export function createTempProject(files) {
	const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'raqule-test-'));

	for (const [relativePath, content] of Object.entries(files)) {
		const targetPath = path.join(rootDir, relativePath);

		if (relativePath.endsWith('/')) {
			fs.mkdirSync(targetPath, { recursive: true });
			continue;
		}

		fs.mkdirSync(path.dirname(targetPath), { recursive: true });
		fs.writeFileSync(targetPath, content);
	}

	return rootDir;
}

export function removeTempProject(rootDir) {
	if (!rootDir) return;

	fs.rmSync(rootDir, { recursive: true, force: true });
}
