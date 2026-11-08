import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildAskAbout } from '../../src/input/ask.js';

describe('buildAskAbout (non-interactive mode)', () => {
	const originalIsTTY = process.stdin.isTTY;

	afterEach(() => {
		process.stdin.isTTY = originalIsTTY;
	});

	it('uses the directory given as an argument instead of prompting', async () => {
		const askAbout = buildAskAbout({ directory: './my-project' });
		assert.equal(await askAbout.dirPath(), './my-project');
	});

	it('uses the --output path instead of prompting', async () => {
		const askAbout = buildAskAbout({ output: './out' });
		assert.equal(await askAbout.outputPath(), './out');
	});

	it('returns the defaults without prompting when --yes is passed', async () => {
		process.stdin.isTTY = true;
		const askAbout = buildAskAbout({ yes: true });
		assert.equal(await askAbout.dirPath(), './');
		assert.equal(await askAbout.outputPath(), './');
		assert.equal(await askAbout.addConfigFile(), false);
	});

	it('returns the defaults without prompting when there is no TTY (CI / pipes)', async () => {
		process.stdin.isTTY = false;
		const askAbout = buildAskAbout({});
		assert.equal(await askAbout.dirPath(), './');
		assert.equal(await askAbout.outputPath(), './');
		assert.equal(await askAbout.addConfigFile(), false);
	});

	it('still lets explicit arguments win over --yes defaults', async () => {
		const askAbout = buildAskAbout({ yes: true, directory: './a', output: './b' });
		assert.equal(await askAbout.dirPath(), './a');
		assert.equal(await askAbout.outputPath(), './b');
	});
});
