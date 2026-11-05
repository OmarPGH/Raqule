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
	// Flattens a nested filesObj tree into an ordered [relativePath, content]
	// list, independent of formatFiles' own implementation, so we have a
	// ground truth to check formatFiles' output against.
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

	// Splits formatFiles' output into one chunk per file on the real
	// separator, so we can check output *structure* (one block per file)
	// instead of just searching for substrings anywhere in the blob.
	//
	// CAUTION: naive about one thing — formatFiles doesn't escape file
	// content, so content containing the literal separator text fools this
	// into seeing extra blocks. Only use it for fixtures without
	// separator-like content; see the "does not corrupt..." test below for
	// that case, checked directly against formatFiles' raw output instead.
	const BLOCK_SEPARATOR = /-{5}~END~-{5}\n\n/;
	function splitIntoBlocks(result) {
		return result.split(BLOCK_SEPARATOR).filter((block) => block.length > 0);
	}

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
			// And it should not contain any *other* file's content/path —
			// that's what actually proves the boundary held, not just
			// "this substring appears somewhere in the whole result".
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
		// This is exactly the case naive substring-counting assertions miss:
		// "function a() {}" is a substring of "function a() {} // plus more".
		// The block-splitting approach above still has to tell them apart.
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

	// NOTE: documents a real characteristic of formatFiles, surfaced during
	// review: file content is emitted verbatim, with no escaping. If a
	// file's own content contains the separator formatFiles uses between
	// entries, that text passes straight through unmodified — formatFiles
	// itself doesn't lose or corrupt anything, but a naive consumer who
	// splits the output on that separator (like our splitIntoBlocks helper
	// above) would be fooled into seeing more "files" than were given. We
	// verify formatFiles' own behavior directly here (losslessness),
	// without going through splitIntoBlocks, since that helper is exactly
	// what this scenario would break.
	it('does not corrupt a file whose own content contains separator-like text (though a naive splitter could be fooled by it)', () => {
		// To actually fool splitIntoBlocks, the lookalike text has to match
		// the real separator byte-for-byte, including the blank line
		// formatFiles always emits after it ("-----~END~-----\n\n") — and
		// it has to land on its own line, not embedded inside a longer
		// line (e.g. inside a string literal with quotes around it, which
		// turns out NOT to confuse the splitter, since the exact "\n\n"
		// boundary never occurs). This fixture is the realistic worst
		// case: a file whose content happens to end with a line that is
		// exactly the separator text, such as a decorative comment banner.
		const separatorLookalike = 'console.log(1);\n\n-----~END~-----\n\n';
		const filesObj = {
			'tricky.js': { isFolder: false, relativePath: 'tricky.js', extension: 'js', content: separatorLookalike },
			'after.js': { isFolder: false, relativePath: 'after.js', extension: 'js', content: 'const after = true;' },
		};

		const result = formatFiles(filesObj);

		// formatFiles itself must still preserve both files' content
		// verbatim and in full — that's the real contract to verify.
		assert.ok(result.includes(separatorLookalike));
		assert.ok(result.includes('const after = true;'));

		// Document the known footgun: a naive split on the separator
		// yields more chunks than there are files, because the
		// lookalike text inside tricky.js's own content is indistinguishable
		// from a real boundary.
		const blocks = splitIntoBlocks(result);
		assert.ok(blocks.length > 2, 'expected the naive splitter to be fooled by separator-like content, illustrating why callers should not rely on this splitting approach for untrusted file content');
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
