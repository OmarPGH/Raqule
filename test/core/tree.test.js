import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { generateTree } from '../../src/core/tree.js';
import { configurationDefault } from '../../src/shared/constants.js';
import { baseFlags, createTempProject, removeTempProject } from '../support/tempProject.js';

describe('generateTree', () => {
	let projectDir;

	afterEach(() => removeTempProject(projectDir));

	async function treeLinesOf(files, flags = {}, configuration = configurationDefault) {
		projectDir = createTempProject(files);
		const tree = await generateTree(projectDir, { ...baseFlags, ...flags }, configuration);

		return tree.trimEnd().split('\n');
	}

	function mentions(lines, name) {
		return lines.some((line) => line.includes(name));
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

	describe('depth', () => {
		const files = { 'a.js': '', 'src/b.js': '', 'src/deep/c.js': '' };

		it('lists the top level only, without expanding folders, when depth is 1', async () => {
			const lines = await treeLinesOf(files, { depth: 1 });

			assert.ok(lines.some((line) => line.endsWith('src/')));
			assert.equal(mentions(lines, 'b.js'), false);
		});

		it('expands exactly one folder level when depth is 2', async () => {
			const lines = await treeLinesOf(files, { depth: 2 });

			assert.ok(mentions(lines, 'b.js'));
			assert.ok(mentions(lines, 'deep/'));
			assert.equal(mentions(lines, 'c.js'), false);
		});

		it('expands every level when depth is unlimited', async () => {
			const lines = await treeLinesOf(files);

			assert.ok(mentions(lines, 'c.js'));
		});
	});

	describe('ignored folders', () => {
		const files = { 'node_modules/dep.js': '', 'src/a.js': '' };

		it('lists a default-ignored folder but does not expand it', async () => {
			const lines = await treeLinesOf(files);

			assert.ok(lines.some((line) => line.endsWith('node_modules/')));
			assert.equal(mentions(lines, 'dep.js'), false);
			assert.ok(mentions(lines, 'a.js'));
		});

		it('does not expand a folder ignored by a path pattern from the config', async () => {
			const lines = await treeLinesOf(
				{ 'src/generated/x.js': '', 'src/keep/y.js': '' },
				{},
				{ ignore: ['src/generated'] },
			);

			assert.ok(mentions(lines, 'generated/'));
			assert.equal(mentions(lines, 'x.js'), false);
			assert.ok(mentions(lines, 'y.js'));
		});

		for (const [flagName, flags] of [
			['exclude', { exclude: ['src'] }],
			['treeExclude', { treeExclude: ['src'] }],
		]) {
			it(`does not expand a folder passed through ${flagName}`, async () => {
				const lines = await treeLinesOf(files, flags);

				assert.ok(lines.some((line) => line.endsWith('src/')));
				assert.equal(mentions(lines, 'a.js'), false);
			});
		}

		it('still expands a folder passed through contentExclude, which only affects the contents', async () => {
			const lines = await treeLinesOf(files, { contentExclude: ['src'] });

			assert.ok(mentions(lines, 'a.js'));
		});

		for (const [flagName, flags] of [
			['all', { all: true }],
			['include', { include: ['node_modules'] }],
			['treeInclude', { treeInclude: ['node_modules'] }],
		]) {
			it(`expands a default-ignored folder when ${flagName} is passed`, async () => {
				const lines = await treeLinesOf(files, flags);

				assert.ok(mentions(lines, 'dep.js'));
			});
		}

		it('keeps a default-ignored folder collapsed when only contentInclude is passed', async () => {
			const lines = await treeLinesOf(files, { contentInclude: ['node_modules'] });

			assert.equal(mentions(lines, 'dep.js'), false);
		});
	});
});
