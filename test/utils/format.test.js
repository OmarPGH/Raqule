import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTree, formatFiles, formatFinal } from '../../src/utils/format.js';

describe('formatTree', () => {
	it('wraps the tree string unmodified in a titled code block followed by an end marker', () => {
		const result = formatTree('root/\n  file.js\n  nested/\n    other.ts');

		assert.equal(result, 'Project Tree:\n\n```\nroot/\n  file.js\n  nested/\n    other.ts\n```\n\n-----~END~-----\n\n');
	});

	it('never throws, and always returns a string, for any kind of tree string', () => {
		for (const input of ['', 'single-line', 'line1\nline2\nline3', '   ', '特殊字符/emoji 🚀']) {
			assert.doesNotThrow(() => formatTree(input));
			assert.equal(typeof formatTree(input), 'string');
		}
	});

	it('produces different output for different input', () => {
		assert.notEqual(formatTree('tree A'), formatTree('tree B'));
	});
});

describe('formatFiles', () => {
	function blockOf(relativePath, extension, content) {
		return `${relativePath} Content :\n\n\`\`\`\`\`${extension}\n${content}\n\`\`\`\`\`\n\n-----~END~-----\n\n`;
	}

	it('formats a file as a titled code block of its extension followed by an end marker', () => {
		const filesObj = {
			'a.js': { isFolder: false, relativePath: 'a.js', extension: 'js', content: 'let a = 1;' },
		};

		const result = formatFiles(filesObj);

		assert.equal(result, 'a.js Content :\n\n`````js\nlet a = 1;\n`````\n\n-----~END~-----\n\n');
	});

	it('formats the files of nested folders as one block each, depth-first', () => {
		const filesObj = {
			src: {
				isFolder: true,
				children: {
					'a.js': { isFolder: false, relativePath: 'src/a.js', extension: 'js', content: 'const a = 1;' },
					nested: {
						isFolder: true,
						children: {
							'b.ts': { isFolder: false, relativePath: 'src/nested/b.ts', extension: 'ts', content: 'const b = 2;' },
						},
					},
				},
			},
			'readme.md': { isFolder: false, relativePath: 'readme.md', extension: 'md', content: '# Hello' },
		};

		const result = formatFiles(filesObj);

		assert.equal(
			result,
			blockOf('src/a.js', 'js', 'const a = 1;') + blockOf('src/nested/b.ts', 'ts', 'const b = 2;') + blockOf('readme.md', 'md', '# Hello'),
		);
	});

	it('keeps the order files were encountered in when a folder sits between two files', () => {
		const filesObj = {
			'first.js': { isFolder: false, relativePath: 'first.js', extension: 'js', content: 'first' },
			folder: {
				isFolder: true,
				children: {
					'second.js': { isFolder: false, relativePath: 'folder/second.js', extension: 'js', content: 'second' },
				},
			},
			'third.js': { isFolder: false, relativePath: 'third.js', extension: 'js', content: 'third' },
		};

		const result = formatFiles(filesObj);

		assert.equal(
			result,
			blockOf('first.js', 'js', 'first') + blockOf('folder/second.js', 'js', 'second') + blockOf('third.js', 'js', 'third'),
		);
	});

	it('includes a file with empty content as its own block, without dropping or merging it', () => {
		const filesObj = {
			'empty.js': { isFolder: false, relativePath: 'empty.js', extension: 'js', content: '' },
			'after.js': { isFolder: false, relativePath: 'after.js', extension: 'js', content: 'const after = true;' },
		};

		const result = formatFiles(filesObj);

		assert.equal(result, blockOf('empty.js', 'js', '') + blockOf('after.js', 'js', 'const after = true;'));
	});

	it('returns an empty string for no entries, and for folders with no files inside them', () => {
		assert.equal(formatFiles({}), '');
		assert.equal(formatFiles({ emptyFolder: { isFolder: true, children: {} } }), '');
		assert.equal(
			formatFiles({
				outer: { isFolder: true, children: { inner: { isFolder: true, children: {} } } },
			}),
			''
		);
	});

	it('keeps file boundaries intact even when one file\'s content is a substring of another\'s', () => {
		const filesObj = {
			'short.js': { isFolder: false, relativePath: 'short.js', extension: 'js', content: 'function a() {}' },
			'long.js': { isFolder: false, relativePath: 'long.js', extension: 'js', content: 'function a() {} // plus more' },
		};

		const result = formatFiles(filesObj);

		assert.equal(
			result,
			blockOf('short.js', 'js', 'function a() {}') + blockOf('long.js', 'js', 'function a() {} // plus more'),
		);
	});

	it('formats a file whose content contains separator-like text the same as when it is formatted alone', () => {
		const trickyFile = {
			'tricky.js': { isFolder: false, relativePath: 'tricky.js', extension: 'js', content: 'let a;\n\n-----~END~-----\n\n' },
		};
		const afterFile = {
			'after.js': { isFolder: false, relativePath: 'after.js', extension: 'js', content: 'const after = true;' },
		};

		const result = formatFiles({ ...trickyFile, ...afterFile });

		assert.equal(result, formatFiles(trickyFile) + formatFiles(afterFile));
	});
});

describe('formatFinal', () => {
	it('is just concatenation: swapping arguments swaps the output order', () => {
		assert.equal(formatFinal('A', 'B'), 'A' + 'B');
		assert.equal(formatFinal('B', 'A'), 'B' + 'A');
	});

	it('never throws for empty strings', () => {
		assert.doesNotThrow(() => formatFinal('', ''));
	});
});
