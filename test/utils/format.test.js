import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTree, formatFiles, formatFinal } from '../../src/utils/format.js';

describe('formatTree', () => {
	it('is lossless: the exact tree string can be recovered from the output', () => {
		const treeStr = 'root/\n  file.js\n  nested/\n    other.ts';
		const result = formatTree(treeStr);

		assert.equal(typeof result, 'string');
		// The job of formatTree is to wrap treeStr for display without
		// mutating it. However it chooses to wrap it, the original text
		// must appear in the output verbatim and unsplit.
		assert.ok(result.includes(treeStr));
	});

	it('never throws, and always returns a string, no matter what kind of tree string it gets', () => {
		for (const input of ['', 'single-line', 'line1\nline2\nline3', '   ', '特殊字符/emoji 🚀']) {
			assert.doesNotThrow(() => formatTree(input));
			assert.equal(typeof formatTree(input), 'string');
		}
	});

	it('produces different output for different input (it is not a constant string)', () => {
		assert.notEqual(formatTree('tree A'), formatTree('tree B'));
	});
});

describe('formatFiles', () => {
	// Flattens a nested filesObj tree into { relativePath: content } pairs,
	// independent of formatFiles' own implementation, so we have a ground
	// truth to check formatFiles' output against.
	function flatten(entries, out = {}) {
		for (const entry of Object.values(entries)) {
			if (entry.isFolder) {
				flatten(entry.children, out);
			} else {
				out[entry.relativePath] = entry.content;
			}
		}
		return out;
	}

	it('is lossless: every file\'s content appears in the output exactly once', () => {
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

		for (const [relativePath, content] of Object.entries(expected)) {
			// The content must show up, and show up only once — if it
			// appeared twice we'd be duplicating a file in the output.
			const occurrences = result.split(content).length - 1;
			assert.equal(occurrences, 1, `expected "${content}" (from ${relativePath}) to appear exactly once`);
		}
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

	it('keeps two files from running into each other with zero separation', () => {
		const filesObj = {
			'first.js': { isFolder: false, relativePath: 'first.js', extension: 'js', content: 'A' },
			'second.js': { isFolder: false, relativePath: 'second.js', extension: 'js', content: 'B' },
		};

		const result = formatFiles(filesObj);

		// Whatever the separator looks like, file boundaries must stay
		// distinguishable: concatenating the two contents directly
		// ("AB") must not appear as a substring of the result.
		assert.ok(!result.includes('AB'));
	});
});

describe('formatFinal', () => {
	it('is lossless: both the formatted tree and formatted files are recoverable from the output', () => {
		const result = formatFinal('TREE_PART', 'FILES_PART');

		assert.ok(result.includes('TREE_PART'));
		assert.ok(result.includes('FILES_PART'));
	});

	it('orders the tree before the files, since that is how output is consumed top-to-bottom', () => {
		const result = formatFinal('TREE_PART', 'FILES_PART');
		assert.ok(result.indexOf('TREE_PART') < result.indexOf('FILES_PART'));
	});

	it('is just concatenation: swapping arguments swaps the output order', () => {
		assert.equal(formatFinal('A', 'B'), 'A' + 'B');
		assert.equal(formatFinal('B', 'A'), 'B' + 'A');
	});

	it('never throws for empty strings', () => {
		assert.doesNotThrow(() => formatFinal('', ''));
	});
});
