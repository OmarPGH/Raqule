import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildAskAbout } from '../../src/input/ask.js';

const failingPrompts = {
	input: async () => { throw new Error('unexpected prompt'); },
	confirm: async () => { throw new Error('unexpected prompt'); },
};

const buildSilent = (flags) => buildAskAbout(flags, failingPrompts);

async function askAll(askAbout) {
	return {
		dirPath: await askAbout.dirPath(),
		outputPath: await askAbout.outputPath(),
		addConfigFile: await askAbout.addConfigFile(),
	};
}

describe('buildAskAbout when no prompt should be shown', () => {
	let logs;

	beforeEach(() => {
		logs = [];
		mock.method(console, 'log', (...args) => logs.push(args.join(' ')));
	});

	afterEach(() => {
		mock.restoreAll();
	});

	it('returns preset flag values even without -n or -D', async () => {
		const result = await askAll(buildSilent({
			directoryPath: '/some/project',
			output: '/some/out',
			createConfig: true,
		}));

		assert.deepEqual(result, {
			dirPath: '/some/project',
			outputPath: '/some/out',
			addConfigFile: true,
		});
	});

	for (const [mode, flags] of [
		['-n', { nonInteractive: true }],
		['-D', { default: true }],
	]) {
		it(`uses defaults for every question when ${mode} is used alone`, async () => {
			const result = await askAll(buildSilent(flags));

			assert.deepEqual(result, {
				dirPath: './',
				outputPath: './',
				addConfigFile: false,
			});
		});
	}

	it('with -n, prefers the passed flag and falls back to defaults for the rest', async () => {
		const result = await askAll(buildSilent({ nonInteractive: true, output: '/some/out' }));

		assert.deepEqual(result, {
			dirPath: './',
			outputPath: '/some/out',
			addConfigFile: false,
		});
	});

	it('with -n, answers yes to the config question when --cc is passed', async () => {
		const addConfigFile = await buildSilent({ nonInteractive: true, createConfig: true }).addConfigFile();
		assert.equal(addConfigFile, true);
	});

	it('keeps each instance on its own flags', async () => {
		const first = buildSilent({ directoryPath: '/project-a' });
		const second = buildSilent({ directoryPath: '/project-b' });

		assert.equal(await first.dirPath(), '/project-a');
		assert.equal(await second.dirPath(), '/project-b');
	});

	it('does not leak a preset value from a later instance into an earlier one', async () => {
		const first = buildSilent({ nonInteractive: true });
		buildSilent({ nonInteractive: true, output: '/some/out' });

		assert.equal(await first.outputPath(), './');
	});

	it('tells the user whether each value came from a flag or from the default', async () => {
		const askAbout = buildSilent({ nonInteractive: true, output: '/some/out' });

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

	it('asks for the directory path with its message and default', async () => {
		const dirPath = await buildAskAbout({}, fakePrompts).dirPath();

		assert.equal(dirPath, 'typed answer');
		assert.equal(fakePrompts.input.mock.callCount(), 1);
		assert.deepEqual(fakePrompts.input.mock.calls[0].arguments[0], {
			message: 'Your directory path :',
			default: './',
		});
	});

	it('asks for the output path with its message and default', async () => {
		const outputPath = await buildAskAbout({}, fakePrompts).outputPath();

		assert.equal(outputPath, 'typed answer');
		assert.deepEqual(fakePrompts.input.mock.calls[0].arguments[0], {
			message: 'Your output path :',
			default: './',
		});
	});

	it('asks the config file question as a confirmation that defaults to no', async () => {
		const addConfigFile = await buildAskAbout({}, fakePrompts).addConfigFile();

		assert.equal(addConfigFile, true);
		assert.equal(fakePrompts.confirm.mock.callCount(), 1);
		assert.deepEqual(fakePrompts.confirm.mock.calls[0].arguments[0], {
			message: 'Do you want to add a config file :',
			default: false,
		});
	});

	for (const [mode, flags] of [
		['-n', { nonInteractive: true }],
		['-D', { default: true }],
	]) {
		it(`never prompts for any question when ${mode} is used`, async () => {
			await askAll(buildAskAbout(flags, fakePrompts));

			assert.equal(fakePrompts.input.mock.callCount(), 0);
			assert.equal(fakePrompts.confirm.mock.callCount(), 0);
		});
	}

	it('never prompts when every value is already given by a flag', async () => {
		await askAll(buildAskAbout(
			{ directoryPath: '/some/project', output: '/some/out', createConfig: false },
			fakePrompts,
		));

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
