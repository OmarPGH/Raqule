import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { gather } from '../../src/core/gather.js';
import { configurationDefault } from '../../src/shared/constants.js';
import { baseFlags, createTempProject, removeTempProject } from '../support/tempProject.js';

const BINARY_PLACEHOLDER = '[Binary file skipped]';

describe('gather', () => {
	let projectDir;

	afterEach(() => removeTempProject(projectDir));

	async function gatherFrom(files, flags = {}, configuration = configurationDefault) {
		projectDir = createTempProject(files);

		return gather(projectDir, { ...baseFlags, ...flags }, configuration);
	}

	describe('file entries', () => {
		it('describes a file with its path, relative path, content and extension', async () => {
			const result = await gatherFrom({ 'index.js': 'let x = 1;' });

			assert.deepEqual(result['index.js'], {
				isFolder: false,
				path: path.join(projectDir, 'index.js'),
				relativePath: 'index.js',
				content: 'let x = 1;',
				extension: 'js',
			});
		});

		it('keeps an empty extension and the full content for a file without an extension', async () => {
			const result = await gatherFrom({ Makefile: 'all:' });

			assert.equal(result.Makefile.extension, '');
			assert.equal(result.Makefile.content, 'all:');
		});

		it('returns an empty string as the content of an empty file', async () => {
			const result = await gatherFrom({ 'empty.js': '' });

			assert.equal(result['empty.js'].content, '');
		});

		it('keeps only the first 3 lines of a LICENSE file', async () => {
			const result = await gatherFrom({ LICENSE: 'line1\nline2\nline3\nline4' });

			assert.equal(result.LICENSE.content, 'line1\nline2\nline3');
		});
	});

	describe('folder entries', () => {
		it('nests children under their folder and uses forward slashes in relative paths', async () => {
			const result = await gatherFrom({ 'src/util/a.js': 'x' });

			assert.equal(result.src.isFolder, true);
			assert.equal(result.src.children.util.isFolder, true);
			assert.equal(result.src.children.util.children['a.js'].relativePath, 'src/util/a.js');
		});

		it('returns an empty children object for an empty folder', async () => {
			const result = await gatherFrom({ 'empty/': '' });

			assert.deepEqual(result.empty, { isFolder: true, children: {} });
		});
	});

	describe('binary files', () => {
		for (const [fileName, extension] of [
			['logo.png', 'png'],
			['PHOTO.JPG', 'JPG'],
			['archive.zip', 'zip'],
		]) {
			it(`replaces the content of ${fileName} with a placeholder and keeps its extension`, async () => {
				const result = await gatherFrom({ [fileName]: 'readable text that must not be read' });

				assert.equal(result[fileName].content, BINARY_PLACEHOLDER);
				assert.equal(result[fileName].extension, extension);
			});
		}
	});

	describe('ignoring', () => {
		it('leaves out default-ignored folders entirely', async () => {
			const result = await gatherFrom({ 'node_modules/dep.js': '', 'index.js': '' });

			assert.deepEqual(Object.keys(result), ['index.js']);
		});

		it('leaves out files matching an ignore pattern from the config', async () => {
			const result = await gatherFrom({ 'a.md': '', 'b.js': '' }, {}, { ignore: ['*.md'] });

			assert.deepEqual(Object.keys(result), ['b.js']);
		});

		it('leaves out a folder matching a path pattern from the config', async () => {
			const result = await gatherFrom(
				{ 'src/generated/x.js': '', 'src/keep/y.js': '' },
				{},
				{ ignore: ['src/generated'] },
			);

			assert.deepEqual(Object.keys(result.src.children), ['keep']);
		});

		for (const [flagName, flags] of [
			['exclude', { exclude: ['*.md'] }],
			['contentExclude', { contentExclude: ['*.md'] }],
		]) {
			it(`leaves out files matching ${flagName}`, async () => {
				const result = await gatherFrom({ 'a.md': '', 'b.js': '' }, flags);

				assert.deepEqual(Object.keys(result), ['b.js']);
			});
		}

		it('still gathers files matching treeExclude, which only affects the tree', async () => {
			const result = await gatherFrom({ 'a.md': '', 'b.js': '' }, { treeExclude: ['*.md'] });

			assert.deepEqual(Object.keys(result).sort(), ['a.md', 'b.js']);
		});

		for (const [flagName, flags] of [
			['all', { all: true }],
			['include', { include: ['node_modules'] }],
			['contentInclude', { contentInclude: ['node_modules'] }],
		]) {
			it(`gathers a default-ignored folder when ${flagName} is passed`, async () => {
				const result = await gatherFrom({ 'node_modules/dep.js': 'dep' }, flags);

				assert.equal(result.node_modules.children['dep.js'].content, 'dep');
			});
		}

		it('keeps a default-ignored folder out when only treeInclude is passed', async () => {
			const result = await gatherFrom({ 'node_modules/dep.js': 'dep' }, { treeInclude: ['node_modules'] });

			assert.deepEqual(result, {});
		});
	});

	describe('depth', () => {
		const files = { 'a.js': 'a', 'src/b.js': 'b' };

		it('returns folders with empty children, without reading inside them, when depth is 1', async () => {
			const result = await gatherFrom(files, { depth: 1 });

			assert.equal(result['a.js'].content, 'a');
			assert.deepEqual(result.src, { isFolder: true, children: {} });
		});

		it('reads one folder level when depth is 2', async () => {
			const result = await gatherFrom(files, { depth: 2 });

			assert.equal(result.src.children['b.js'].content, 'b');
		});
	});
});
