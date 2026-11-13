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
	// Independently flattens a nested filesObj into [relativePath, content]
	// pairs, as ground truth to check formatFiles' output against.
	function flatten(entries, out = []) {
		for (const entry of Object.values(entries)) {
			if (entry.isFolder) {
				flatten(entry.children, out);
			} else {
				out.push([entry.relativePath, entry.content]);
			}
		}
		return out;
	}

	// Splits output into one chunk per file on the real separator. Naive
	// about one thing: content containing the literal separator text fools
	// it into seeing extra blocks (see the "does not corrupt..." test,
	// which checks that case directly against formatFiles' raw output).
	const BLOCK_SEPARATOR = /-{5}~END~-{5}\n\n/;
	function splitIntoBlocks(result) {
		return result.split(BLOCK_SEPARATOR).filter((block) => block.length > 0);
	}

	it('formats a file as a titled code block of its extension followed by an end marker', () => {
		const filesObj = {
			'a.js': { isFolder: false, relativePath: 'a.js', extension: 'js', content: 'let a = 1;' },
		};

		const result = formatFiles(filesObj);

		assert.equal(result, 'a.js Content :\n\n`````js\nlet a = 1;\n`````\n\n-----~END~-----\n\n');
	});

	it('produces exactly one output block per file, each containing only that file\'s content', () => {
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

		const expected = flatten(filesObj);
		const result = formatFiles(filesObj);
		const blocks = splitIntoBlocks(result);

		assert.equal(blocks.length, expected.length);

		expected.forEach(([relativePath, content], i) => {
			assert.ok(blocks[i].includes(relativePath), `block ${i} should mention ${relativePath}`);
			assert.ok(blocks[i].includes(content), `block ${i} should contain its own content`);
			expected.forEach(([otherPath, otherContent], j) => {
				if (i === j) return;
				assert.ok(!blocks[i].includes(otherContent), `block ${i} (${relativePath}) leaked content from ${otherPath}`);
			});
		});
	});

	it('preserves the relative order files were encountered in, depth-first', () => {
		const filesObj = {
			'first.js': { isFolder: false, relativePath: 'first.js', extension: 'js', content: 'FIRST_MARKER' },
			folder: {
				isFolder: true,
				children: {
					'second.js': { isFolder: false, relativePath: 'folder/second.js', extension: 'js', content: 'SECOND_MARKER' },
				},
			},
			'third.js': { isFolder: false, relativePath: 'third.js', extension: 'js', content: 'THIRD_MARKER' },
		};

		const result = formatFiles(filesObj);
		const positions = ['FIRST_MARKER', 'SECOND_MARKER', 'THIRD_MARKER'].map((m) => result.indexOf(m));

		assert.ok(positions.every((p) => p !== -1));
		assert.ok(positions[0] < positions[1]);
		assert.ok(positions[1] < positions[2]);
	});

	it('includes a file with empty content as its own block, without dropping or merging it', () => {
		const filesObj = {
			'empty.js': { isFolder: false, relativePath: 'empty.js', extension: 'js', content: '' },
			'after.js': { isFolder: false, relativePath: 'after.js', extension: 'js', content: 'const after = true;' },
		};

		const result = formatFiles(filesObj);
		const blocks = splitIntoBlocks(result);

		assert.equal(blocks.length, 2);
		assert.ok(blocks[0].includes('empty.js'));
		assert.ok(blocks[1].includes('const after = true;'));
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
		const blocks = splitIntoBlocks(result);

		assert.equal(blocks.length, 2);
		assert.ok(blocks[0].includes('function a() {}'));
		assert.ok(!blocks[0].includes('// plus more'));
		assert.ok(blocks[1].includes('function a() {} // plus more'));
	});

	it('does not corrupt a file whose own content contains separator-like text', () => {
		const separatorLookalike = 'console.log(1);\n\n-----~END~-----\n\n';
		const filesObj = {
			'tricky.js': { isFolder: false, relativePath: 'tricky.js', extension: 'js', content: separatorLookalike },
			'after.js': { isFolder: false, relativePath: 'after.js', extension: 'js', content: 'const after = true;' },
		};

		const result = formatFiles(filesObj);

		assert.ok(result.includes(separatorLookalike));
		assert.ok(result.includes('const after = true;'));

		// A naive split on the separator yields more chunks than files,
		// since the lookalike text is indistinguishable from a real
		// boundary — illustrating why splitIntoBlocks isn't safe for
		// untrusted content, even though formatFiles itself is lossless.
		const blocks = splitIntoBlocks(result);
		assert.ok(blocks.length > 2);
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
