import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readConfig, writeConfig } from '../../src/config/io.js';
import { configFileName } from '../../src/shared/constants.js';
import { createTempProject, removeTempProject } from '../support/tempProject.js';

describe('config io', () => {
	let projectDir;

	afterEach(() => removeTempProject(projectDir));

	describe('readConfig', () => {
		it('returns the parsed content of a valid config file', async () => {
			projectDir = createTempProject({ [configFileName]: 'ignore = ["dist", "*.log"]\n' });

			const result = await readConfig(projectDir);

			assert.deepEqual({ ...result }, { ignore: ['dist', '*.log'] });
		});

		it('returns undefined when the folder has no config file', async () => {
			projectDir = createTempProject({ 'index.js': 'let x = 1;' });

			const result = await readConfig(projectDir);

			assert.equal(result, undefined);
		});

		it('returns undefined when the folder does not exist', async () => {
			projectDir = createTempProject({});

			const result = await readConfig(path.join(projectDir, 'missing'));

			assert.equal(result, undefined);
		});

		it('returns "broken" when the config file is not valid TOML', async () => {
			projectDir = createTempProject({ [configFileName]: 'ignore = [unclosed' });

			const result = await readConfig(projectDir);

			assert.equal(result, 'broken');
		});

		it('returns an empty object for an empty config file', async () => {
			projectDir = createTempProject({ [configFileName]: '' });

			const result = await readConfig(projectDir);

			assert.deepEqual({ ...result }, {});
		});

		it('returns undefined when the config path is a folder instead of a file', async () => {
			projectDir = createTempProject({ [`${configFileName}/`]: null });

			const result = await readConfig(projectDir);

			assert.equal(result, undefined);
		});

		it('does not pick up a config file that sits in a parent folder', async () => {
			projectDir = createTempProject({
				[configFileName]: 'ignore = ["dist"]\n',
				'nested/index.js': 'let x = 1;',
			});

			const result = await readConfig(path.join(projectDir, 'nested'));

			assert.equal(result, undefined);
		});
	});

	describe('writeConfig', () => {
		it('creates the config file in the given folder', async () => {
			projectDir = createTempProject({});

			await writeConfig(projectDir, { ignore: [] });

			assert.ok(fs.existsSync(path.join(projectDir, configFileName)));
		});

		it('returns true after writing', async () => {
			projectDir = createTempProject({});

			const result = await writeConfig(projectDir, { ignore: [] });

			assert.equal(result, true);
		});

		it('writes content that readConfig reads back unchanged', async () => {
			projectDir = createTempProject({});
			const content = { ignore: ['dist', 'coverage', '*.log'] };

			await writeConfig(projectDir, content);
			const result = await readConfig(projectDir);

			assert.deepEqual({ ...result }, content);
		});

		it('replaces the content of an existing config file', async () => {
			projectDir = createTempProject({ [configFileName]: 'ignore = ["old"]\n' });

			await writeConfig(projectDir, { ignore: ['new'] });
			const result = await readConfig(projectDir);

			assert.deepEqual({ ...result }, { ignore: ['new'] });
		});

		it('rejects when the folder does not exist', async () => {
			projectDir = createTempProject({});

			await assert.rejects(writeConfig(path.join(projectDir, 'missing'), { ignore: [] }), { code: 'ENOENT' });
		});
	});
});
