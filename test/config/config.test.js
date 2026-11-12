import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../src/config/config.js';
import { configFileName, configurationDefault } from '../../src/shared/constants.js';
import { createTempProject, removeTempProject } from '../support/tempProject.js';

describe('config', () => {
	let projectDir;

	afterEach(() => removeTempProject(projectDir));

	function buildAskAbout(answer) {
		const calls = [];

		return {
			calls,
			addConfigFile: async () => {
				calls.push('addConfigFile');

				return answer;
			},
		};
	}

	describe('when the project has a config file', () => {
		it('returns the content of the config file', async () => {
			projectDir = createTempProject({ [configFileName]: 'ignore = ["dist"]\n' });

			const result = await config(projectDir, buildAskAbout(false));

			assert.deepEqual({ ...result }, { ignore: ['dist'] });
		});

		it('does not ask about creating a config file', async () => {
			projectDir = createTempProject({ [configFileName]: 'ignore = []\n' });
			const askAbout = buildAskAbout(true);

			await config(projectDir, askAbout);

			assert.deepEqual(askAbout.calls, []);
		});

		it('throws a syntax error when the config file is not valid TOML', async () => {
			projectDir = createTempProject({ [configFileName]: 'ignore = [unclosed' });

			await assert.rejects(config(projectDir, buildAskAbout(false)), /Syntax Error/);
		});

		it('throws a config error when the content does not match the schema', async () => {
			projectDir = createTempProject({ [configFileName]: 'ignore = "dist"\n' });

			await assert.rejects(config(projectDir, buildAskAbout(false)), /Config error at:/);
		});
	});

	describe('when the project has no config file', () => {
		it('asks once whether to add a config file', async () => {
			projectDir = createTempProject({ 'index.js': 'let x = 1;' });
			const askAbout = buildAskAbout(false);

			await config(projectDir, askAbout);

			assert.deepEqual(askAbout.calls, ['addConfigFile']);
		});

		it('returns the default configuration when the answer is no', async () => {
			projectDir = createTempProject({ 'index.js': 'let x = 1;' });

			const result = await config(projectDir, buildAskAbout(false));

			assert.deepEqual(result, configurationDefault);
		});

		it('does not create a config file when the answer is no', async () => {
			projectDir = createTempProject({ 'index.js': 'let x = 1;' });

			await config(projectDir, buildAskAbout(false));

			assert.equal(fs.existsSync(path.join(projectDir, configFileName)), false);
		});

		it('creates a config file with the default configuration when the answer is yes', async () => {
			projectDir = createTempProject({ 'index.js': 'let x = 1;' });

			await config(projectDir, buildAskAbout(true));

			assert.equal(fs.readFileSync(path.join(projectDir, configFileName), 'utf8'), 'ignore = []\n');
		});

		it('returns the default configuration when the answer is yes', async () => {
			projectDir = createTempProject({ 'index.js': 'let x = 1;' });

			const result = await config(projectDir, buildAskAbout(true));

			assert.deepEqual(result, configurationDefault);
		});
	});
});
