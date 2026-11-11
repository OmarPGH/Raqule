import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildAskAbout } from '../../src/input/ask.js';

const failingPrompts = {
	input: async () => { throw new Error('unexpected prompt'); },
	confirm: async () => { throw new Error('unexpected prompt'); },
};

const buildWithoutPrompts = (flags) => buildAskAbout(flags, failingPrompts);

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
		const askAbout = buildWithoutPrompts({
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
		const askAbout = buildWithoutPrompts({ nonInteractive: true });

		const dirPath = await askAbout.dirPath();
		const outputPath = await askAbout.outputPath();
		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(dirPath, './');
		assert.equal(outputPath, './');
		assert.equal(addConfigFile, false);
	});

	it('uses the default for every question when -D is used alone', async () => {
		const askAbout = buildWithoutPrompts({ default: true });

		const dirPath = await askAbout.dirPath();
		const outputPath = await askAbout.outputPath();
		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(dirPath, './');
		assert.equal(outputPath, './');
		assert.equal(addConfigFile, false);
	});

	it('with -n, uses the passed flag and the defaults for the other questions', async () => {
		const askAbout = buildWithoutPrompts({ nonInteractive: true, output: '/some/out' });

		const outputPath = await askAbout.outputPath();
		const dirPath = await askAbout.dirPath();
		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(outputPath, '/some/out');
		assert.equal(dirPath, './');
		assert.equal(addConfigFile, false);
	});

	it('with -n, answers yes to the config file question when --cc is passed', async () => {
		const askAbout = buildWithoutPrompts({ nonInteractive: true, createConfig: true });

		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(addConfigFile, true);
	});

	it('keeps each instance on its own flags when several are created in the same process', async () => {
		const first = buildWithoutPrompts({ directoryPath: '/project-a' });
		const second = buildWithoutPrompts({ directoryPath: '/project-b' });

		const firstDirPath = await first.dirPath();
		const secondDirPath = await second.dirPath();

		assert.equal(firstDirPath, '/project-a');
		assert.equal(secondDirPath, '/project-b');
	});

	it('does not leak a preset value from a later instance into an earlier one', async () => {
		const first = buildWithoutPrompts({ nonInteractive: true });
		buildWithoutPrompts({ nonInteractive: true, output: '/some/out' });

		const outputPath = await first.outputPath();

		assert.equal(outputPath, './');
	});

	it('tells the user whether each value came from a flag or from the default', async () => {
		const askAbout = buildWithoutPrompts({ nonInteractive: true, output: '/some/out' });

		await askAbout.outputPath();
		await askAbout.dirPath();

		assert.match(logs[0], /preset/);
		assert.match(logs[1], /default/);
	});
});

describe('buildAskAbout when the user must be prompted', () => {
	let fakePrompts;

	beforeEach(() => {
		mock.method(console, 'log', () => {});
		fakePrompts = {
			input: mock.fn(async () => 'typed answer'),
			confirm: mock.fn(async () => true),
		};
	});

	afterEach(() => {
		mock.restoreAll();
	});

	it('asks for the directory path with its message and default when no flag is passed', async () => {
		const askAbout = buildAskAbout({}, fakePrompts);

		const dirPath = await askAbout.dirPath();

		assert.equal(dirPath, 'typed answer');
		assert.equal(fakePrompts.input.mock.callCount(), 1);
		assert.deepEqual(fakePrompts.input.mock.calls[0].arguments[0], {
			message: 'Your directory path :',
			default: './',
		});
	});

	it('asks for the output path with its message and default when no flag is passed', async () => {
		const askAbout = buildAskAbout({}, fakePrompts);

		const outputPath = await askAbout.outputPath();

		assert.equal(outputPath, 'typed answer');
		assert.deepEqual(fakePrompts.input.mock.calls[0].arguments[0], {
			message: 'Your output path :',
			default: './',
		});
	});

	it('asks the config file question as a confirmation that defaults to no', async () => {
		const askAbout = buildAskAbout({}, fakePrompts);

		const addConfigFile = await askAbout.addConfigFile();

		assert.equal(addConfigFile, true);
		assert.equal(fakePrompts.confirm.mock.callCount(), 1);
		assert.deepEqual(fakePrompts.confirm.mock.calls[0].arguments[0], {
			message: 'Do you want to add a config file :',
			default: false,
		});
	});

	for (const [modeName, flags] of [
		['-n', { nonInteractive: true }],
		['-D', { default: true }],
	]) {
		it(`never prompts for any question when ${modeName} is used`, async () => {
			const askAbout = buildAskAbout(flags, fakePrompts);

			await askAbout.dirPath();
			await askAbout.outputPath();
			await askAbout.addConfigFile();

			assert.equal(fakePrompts.input.mock.callCount(), 0);
			assert.equal(fakePrompts.confirm.mock.callCount(), 0);
		});
	}

	it('never prompts when every value is already given by a flag', async () => {
		const askAbout = buildAskAbout(
			{ directoryPath: '/some/project', output: '/some/out', createConfig: false },
			fakePrompts,
		);

		await askAbout.dirPath();
		await askAbout.outputPath();
		await askAbout.addConfigFile();

		assert.equal(fakePrompts.input.mock.callCount(), 0);
		assert.equal(fakePrompts.confirm.mock.callCount(), 0);
	});

	it('prompts only for the questions that no flag answers', async () => {
		const askAbout = buildAskAbout({ output: '/some/out' }, fakePrompts);

		await askAbout.dirPath();
		await askAbout.outputPath();

		assert.equal(fakePrompts.input.mock.callCount(), 1);
		assert.equal(fakePrompts.input.mock.calls[0].arguments[0].message, 'Your directory path :');
	});
});
