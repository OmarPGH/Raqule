import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTree, formatFiles, formatFinal } from '../../src/utils/format.js';

describe('formatTree', () => {
	it('includes the given tree string in the output, untouched', () => {
		const treeStr = 'root/\n  file.js';
		const result = formatTree(treeStr);

		assert.equal(typeof result, 'string');
		assert.ok(result.includes(treeStr));
	});

	it('does not throw and still returns a string for an empty tree string', () => {
		const result = formatTree('');
		assert.equal(typeof result, 'string');
	});
});

describe('formatFiles', () => {
	it('includes the relative path and content of a single file entry', () => {
		const filesObj = {
			'index.js': {
				isFolder: false,
				relativePath: 'index.js',
				extension: 'js',
				content: 'console.log("hi");',
			},
		};

		const result = formatFiles(filesObj);

		assert.ok(result.includes('index.js'));
		assert.ok(result.includes('console.log("hi");'));
	});

	it('recurses into folder entries and includes every nested file', () => {
		const filesObj = {
			src: {
				isFolder: true,
				children: {
					'a.js': {
						isFolder: false,
						relativePath: 'src/a.js',
						extension: 'js',
						content: 'const a = 1;',
					},
					nested: {
						isFolder: true,
						children: {
							'b.ts': {
								isFolder: false,
								relativePath: 'src/nested/b.ts',
								extension: 'ts',
								content: 'const b = 2;',
							},
						},
					},
				},
			},
		};

		const result = formatFiles(filesObj);

		assert.ok(result.includes('src/a.js'));
		assert.ok(result.includes('const a = 1;'));
		assert.ok(result.includes('src/nested/b.ts'));
		assert.ok(result.includes('const b = 2;'));
	});

	it('returns an empty string when given no entries', () => {
		assert.equal(formatFiles({}), '');
	});

	it('skips folders entirely when they contain no files', () => {
		const filesObj = {
			emptyFolder: {
				isFolder: true,
				children: {},
			},
		};

		assert.equal(formatFiles(filesObj), '');
	});

	it('preserves the order files were given in across multiple top-level files', () => {
		const filesObj = {
			'first.js': { isFolder: false, relativePath: 'first.js', extension: 'js', content: 'A' },
			'second.js': { isFolder: false, relativePath: 'second.js', extension: 'js', content: 'B' },
		};

		const result = formatFiles(filesObj);
		const firstIndex = result.indexOf('first.js');
		const secondIndex = result.indexOf('second.js');

		assert.ok(firstIndex !== -1 && secondIndex !== -1);
		assert.ok(firstIndex < secondIndex);
	});

	it('keeps each file visually distinguishable from the next (not concatenated with zero separation)', () => {
		const filesObj = {
			'first.js': { isFolder: false, relativePath: 'first.js', extension: 'js', content: 'A' },
			'second.js': { isFolder: false, relativePath: 'second.js', extension: 'js', content: 'B' },
		};

		const result = formatFiles(filesObj);

		// Whatever the separator looks like, the two files' content blocks
		// must not run directly into each other.
		assert.ok(!result.includes('A' + 'second.js'));
	});
});

describe('formatFinal', () => {
	it('contains both the formatted tree and the formatted files, tree before files', () => {
		const result = formatFinal('TREE_PART', 'FILES_PART');

		assert.ok(result.includes('TREE_PART'));
		assert.ok(result.includes('FILES_PART'));
		assert.ok(result.indexOf('TREE_PART') < result.indexOf('FILES_PART'));
	});

	it('handles empty strings for both arguments without throwing', () => {
		assert.equal(typeof formatFinal('', ''), 'string');
	});
});
