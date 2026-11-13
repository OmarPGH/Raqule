import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateTree } from '../../src/core/tree.js';
import { configurationDefault } from '../../src/shared/constants.js';
import { baseFlags, createTempProject, removeTempProject, symlinkTestOptions } from '../support/tempProject.js';

describe('generateTree', () => {
	let projectDir;

	afterEach(() => removeTempProject(projectDir));

	async function treeLinesOf(files, flags = {}, configuration = configurationDefault) {
		projectDir = createTempProject(files);
		const tree = await generateTree(projectDir, { ...baseFlags, ...flags }, configuration);

		return tree.trimEnd().split('\n');
	}

	describe('layout', () => {
		it('starts with the name of the root folder', async () => {
			const lines = await treeLinesOf({ 'a.js': '' });

			assert.equal(lines[0], path.basename(projectDir));
		});

		it('draws a lone file with the last-item pointer', async () => {
			const lines = await treeLinesOf({ 'a.js': '' });

			assert.deepEqual(lines.slice(1), ['└── a.js']);
		});

		it('adds a trailing slash to folders and indents their children', async () => {
			const lines = await treeLinesOf({ 'src/a.js': '' });

			assert.deepEqual(lines.slice(1), ['└── src/', '    └── a.js']);
		});

		it('marks every entry except the last with the branch pointer', async () => {
			const lines = await treeLinesOf({ 'a.js': '', 'b.js': '' });

			assert.equal(lines.length, 3);
			assert.ok(lines[1].startsWith('├── '));
			assert.ok(lines[2].startsWith('└── '));
		});

		it('keeps the vertical guide under a folder that is not last and uses blank space under the last one', async () => {
			const lines = await treeLinesOf({ 'one/a.js': '', 'two/b.js': '' });

			const [underFirstFolder, underLastFolder] = lines.filter((line) => line.endsWith('.js'));

			assert.ok(underFirstFolder.startsWith('│   └── '));
			assert.ok(underLastFolder.startsWith('    └── '));
		});

		it('shows an empty folder without any children', async () => {
			const lines = await treeLinesOf({ 'empty/': '' });

			assert.deepEqual(lines.slice(1), ['└── empty/']);
		});
	});

	describe('root directory', () => {
		it('matches path patterns against the given root when drawing a sub folder', async () => {
			projectDir = createTempProject({ 'src/generated/x.js': '', 'src/keep/y.js': '' });

			const tree = await generateTree(
				path.join(projectDir, 'src'),
				baseFlags,
				{ ignore: ['src/generated'] },
				projectDir,
			);

			assert.deepEqual(tree.trimEnd().split('\n'), ['src', '├── generated/', '└── keep/', '    └── y.js']);
		});
	});

	describe('depth', () => {
		const files = { 'a.js': '', 'src/b.js': '', 'src/deep/c.js': '' };

		it('lists the top level only, without expanding folders, when depth is 1', async () => {
			const lines = await treeLinesOf(files, { depth: 1 });

			assert.deepEqual(lines.slice(1), ['├── a.js', '└── src/']);
		});

		it('expands exactly one folder level when depth is 2', async () => {
			const lines = await treeLinesOf(files, { depth: 2 });

			assert.deepEqual(lines.slice(1), ['├── a.js', '└── src/', '    ├── b.js', '    └── deep/']);
		});

		it('expands every level when depth is unlimited', async () => {
			const lines = await treeLinesOf(files);

			assert.deepEqual(lines.slice(1), [
				'├── a.js',
				'└── src/',
				'    ├── b.js',
				'    └── deep/',
				'        └── c.js',
			]);
		});
	});

	describe('ignored folders', () => {
		const files = { 'node_modules/dep.js': '', 'src/a.js': '' };
		const defaultTreeLines = ['├── node_modules/', '└── src/', '    └── a.js'];

		it('lists a default-ignored folder but does not expand it', async () => {
			const lines = await treeLinesOf(files);

			assert.deepEqual(lines.slice(1), defaultTreeLines);
		});

		it('does not expand a folder ignored by a path pattern from the config', async () => {
			const lines = await treeLinesOf(
				{ 'src/generated/x.js': '', 'src/keep/y.js': '' },
				{},
				{ ignore: ['src/generated'] },
			);

			assert.deepEqual(lines.slice(1), ['└── src/', '    ├── generated/', '    └── keep/', '        └── y.js']);
		});

		for (const [flagName, flags] of [
			['exclude', { exclude: ['src'] }],
			['treeExclude', { treeExclude: ['src'] }],
		]) {
			it(`does not expand a folder passed through ${flagName}`, async () => {
				const lines = await treeLinesOf(files, flags);

				assert.deepEqual(lines.slice(1), ['├── node_modules/', '└── src/']);
			});
		}

		it('still expands a folder passed through contentExclude, which only affects the contents', async () => {
			const lines = await treeLinesOf(files, { contentExclude: ['src'] });

			assert.deepEqual(lines.slice(1), defaultTreeLines);
		});

		for (const [flagName, flags] of [
			['all', { all: true }],
			['include', { include: ['node_modules'] }],
			['treeInclude', { treeInclude: ['node_modules'] }],
		]) {
			it(`expands a default-ignored folder when ${flagName} is passed`, async () => {
				const lines = await treeLinesOf(files, flags);

				assert.deepEqual(lines.slice(1), ['├── node_modules/', '│   └── dep.js', '└── src/', '    └── a.js']);
			});
		}

		it('keeps a default-ignored folder collapsed when only contentInclude is passed', async () => {
			const lines = await treeLinesOf(files, { contentInclude: ['node_modules'] });

			assert.deepEqual(lines.slice(1), defaultTreeLines);
		});
	});

	describe('unusual project layouts', () => {
		it('lists names with spaces and unicode characters unchanged', async () => {
			const lines = await treeLinesOf({ 'my folder/file name.js': '', 'café/ملف.js': '' });

			assert.deepEqual(lines.slice(1), ['├── café/', '│   └── ملف.js', '└── my folder/', '    └── file name.js']);
		});

		it('shows only the root name for an empty project', async () => {
			const lines = await treeLinesOf({});

			assert.deepEqual(lines, [path.basename(projectDir)]);
		});

		it('expands a project nested 25 folders deep with matching indentation', async () => {
			const folders = Array.from({ length: 25 }, (_, level) => `d${level}`);

			const lines = await treeLinesOf({ [`${folders.join('/')}/bottom.js`]: '' });

			assert.equal(lines.length, 27);
			assert.equal(lines.at(-1), `${'    '.repeat(25)}└── bottom.js`);
		});

		it('lists a symlink to a folder like a file, without following it', symlinkTestOptions, async () => {
			projectDir = createTempProject({ 'real/a.js': '' });
			fs.symlinkSync(path.join(projectDir, 'real'), path.join(projectDir, 'link'));

			const tree = await generateTree(projectDir, baseFlags, configurationDefault);

			assert.deepEqual(tree.trimEnd().split('\n').slice(1), ['├── link', '└── real/', '    └── a.js']);
		});

		it('lists a broken symlink without failing', symlinkTestOptions, async () => {
			projectDir = createTempProject({});
			fs.symlinkSync(path.join(projectDir, 'missing'), path.join(projectDir, 'broken'));

			const tree = await generateTree(projectDir, baseFlags, configurationDefault);

			assert.deepEqual(tree.trimEnd().split('\n').slice(1), ['└── broken']);
		});
	});
});
