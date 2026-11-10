import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildAskAbout } from '../../src/input/ask.js';

// Only non-prompting paths are tested: reaching a real prompt here would hang the test.
describe('buildAskAbout when no prompt should be shown', () => {
	let logs;

	beforeEach(() => {
		logs = [];
		mock.method(console, 'log', (...args) => logs.push(args.join(' ')));
	});

	afterEach(() => {
		mock.restoreAll();
	});

	it('returns the preset flag values even without -n or -D', async () => {
		const askAbout = buildAskAbout({
			directoryPath: '/some/project',
			output: '/some/out',
			createConfig: true,
		});

		const dirPath = await askAbout.dirPath();
		const outputPath = await askAbout.outputPath();
		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(dirPath, '/some/project');
		assert.equal(outputPath, '/some/out');
		assert.equal(addConfigFile, true);
	});

	it('uses the default for every question when -n is used alone', async () => {
		const askAbout = buildAskAbout({ nonInteractive: true });

		const dirPath = await askAbout.dirPath();
		const outputPath = await askAbout.outputPath();
		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(dirPath, './');
		assert.equal(outputPath, './');
		assert.equal(addConfigFile, false);
	});

	it('uses the default for every question when -D is used alone', async () => {
		const askAbout = buildAskAbout({ default: true });

		const dirPath = await askAbout.dirPath();
		const outputPath = await askAbout.outputPath();
		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(dirPath, './');
		assert.equal(outputPath, './');
		assert.equal(addConfigFile, false);
	});

	it('with -n, uses the passed flag and the defaults for the other questions', async () => {
		const askAbout = buildAskAbout({ nonInteractive: true, output: '/some/out' });

		const outputPath = await askAbout.outputPath();
		const dirPath = await askAbout.dirPath();
		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(outputPath, '/some/out');
		assert.equal(dirPath, './');
		assert.equal(addConfigFile, false);
	});

	it('with -n, answers yes to the config file question when --cc is passed', async () => {
		const askAbout = buildAskAbout({ nonInteractive: true, createConfig: true });

		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(addConfigFile, true);
	});

	it('tells the user whether each value came from a flag or from the default', async () => {
		const askAbout = buildAskAbout({ nonInteractive: true, output: '/some/out' });

		await askAbout.outputPath();
		await askAbout.dirPath();

		assert.match(logs[0], /preset/);
		assert.match(logs[1], /default/);
	});
});
