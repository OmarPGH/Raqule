import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTree, formatFiles, formatFinal } from '../../src/utils/format.js';

describe('formatTree', () => {
	it('wraps the tree string in a fenced code block with a header and end marker', () => {
		const result = formatTree('root/\n  file.js');

		assert.ok(result.startsWith('Project Tree:\n\n```\n'));
		assert.ok(result.includes('root/\n  file.js'));
		assert.ok(result.includes('```'));
		assert.ok(result.includes('-----~END~-----'));
	});

	it('still produces the wrapping structure for an empty tree string', () => {
		const result = formatTree('');

		assert.equal(result, 'Project Tree:\n\n```\n\n```\n\n-----~END~-----\n\n');
	});
});

describe('formatFiles', () => {
	it('formats a single file entry with its relative path, extension, and content', () => {
		const filesObj = {
			'index.js': {
				isFolder: false,
				relativePath: 'index.js',
				extension: 'js',
				content: 'console.log("hi");',
			},
		};

		const result = formatFiles(filesObj);

		assert.ok(result.includes('index.js Content :'));
		assert.ok(result.includes('`````js\nconsole.log("hi");\n`````'));
		assert.ok(result.includes('-----~END~-----'));
	});

	it('recurses into folder entries and formats every nested file', () => {
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

		assert.ok(result.includes('src/a.js Content :'));
		assert.ok(result.includes('const a = 1;'));
		assert.ok(result.includes('src/nested/b.ts Content :'));
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

	it('preserves object key order across multiple top-level files', () => {
		const filesObj = {
			'first.js': { isFolder: false, relativePath: 'first.js', extension: 'js', content: 'A' },
			'second.js': { isFolder: false, relativePath: 'second.js', extension: 'js', content: 'B' },
		};

		const result = formatFiles(filesObj);
		const firstIndex = result.indexOf('first.js Content :');
		const secondIndex = result.indexOf('second.js Content :');

		assert.ok(firstIndex !== -1 && secondIndex !== -1);
		assert.ok(firstIndex < secondIndex);
	});
});

describe('formatFinal', () => {
	it('concatenates the formatted tree and formatted files in order', () => {
		const result = formatFinal('TREE_PART', 'FILES_PART');
		assert.equal(result, 'TREE_PARTFILES_PART');
	});

	it('handles empty strings for both arguments', () => {
		assert.equal(formatFinal('', ''), '');
	});
});
