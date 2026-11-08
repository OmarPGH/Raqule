import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildAskAbout } from '../../src/input/ask.js';

describe('buildAskAbout (non-interactive mode)', () => {
	const originalIsTTY = process.stdin.isTTY;

	afterEach(() => {
		process.stdin.isTTY = originalIsTTY;
	});

	it('uses the --directory-path given instead of prompting', async () => {
		const askAbout = buildAskAbout({ directoryPath: './my-project' });
		assert.equal(await askAbout.dirPath(), './my-project');
	});

	it('uses the --output path instead of prompting', async () => {
		const askAbout = buildAskAbout({ output: './out' });
		assert.equal(await askAbout.outputPath(), './out');
	});

	it('returns the defaults without prompting when --non-interactive is passed', async () => {
		process.stdin.isTTY = true;
		const askAbout = buildAskAbout({ nonInteractive: true });
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

	it('returns the defaults without prompting when --default is passed', async () => {
		process.stdin.isTTY = true;
		const askAbout = buildAskAbout({ default: true });
		assert.equal(await askAbout.dirPath(), './');
		assert.equal(await askAbout.outputPath(), './');
		assert.equal(await askAbout.addConfigFile(), false);
	});

	it('still lets explicit flags win over the --non-interactive defaults', async () => {
		const askAbout = buildAskAbout({ nonInteractive: true, directoryPath: './a', output: './b' });
		assert.equal(await askAbout.dirPath(), './a');
		assert.equal(await askAbout.outputPath(), './b');
	});

	it('answers yes to the config prompt when --create-config is passed', async () => {
		process.stdin.isTTY = true;
		const askAbout = buildAskAbout({ createConfig: true });
		assert.equal(await askAbout.addConfigFile(), true);
	});

	it('creates the config in --non-interactive mode only when --create-config is passed', async () => {
		const withoutFlag = buildAskAbout({ nonInteractive: true });
		assert.equal(await withoutFlag.addConfigFile(), false);

		const withFlag = buildAskAbout({ nonInteractive: true, createConfig: true });
		assert.equal(await withFlag.addConfigFile(), true);
	});
});
