import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPatterns } from '../../src/ignore/patterns.js';
import { flatDefaultIgnoreList } from '../../src/ignore/defaultList.js';

const noConfig = { ignore: [] };

describe('buildPatterns', () => {
	describe('sources of ignored patterns', () => {
		it('returns the default ignore list when no flag or config pattern is given', () => {
			const patterns = buildPatterns({}, noConfig, 'content');

			assert.deepEqual(patterns, flatDefaultIgnoreList);
		});

		it('returns nothing when all is passed and nothing else is ignored', () => {
			const patterns = buildPatterns({ all: true }, noConfig, 'tree');

			assert.deepEqual(patterns, []);
		});

		it('does not throw when the config has no ignore list', () => {
			assert.doesNotThrow(() => buildPatterns({ all: true }, {}, 'content'));
		});

		it('adds config, exclude and scope exclude patterns, in that order, to the content scope', () => {
			const flags = { all: true, exclude: ['fromExclude'], contentExclude: ['fromContent'] };

			const patterns = buildPatterns(flags, { ignore: ['fromConfig'] }, 'content');

			assert.deepEqual(patterns, ['fromConfig', 'fromExclude', 'fromContent']);
		});

		it('keeps the default list on top of the user patterns unless all is passed', () => {
			const patterns = buildPatterns({ exclude: ['custom'] }, noConfig, 'content');

			assert.ok(patterns.includes('custom'));
			assert.ok(patterns.includes('node_modules'));
		});
	});

	describe('scopes', () => {
		const flags = { all: true, contentExclude: ['onlyContent'], treeExclude: ['onlyTree'] };

		it('applies contentExclude to the content scope only', () => {
			assert.deepEqual(buildPatterns(flags, noConfig, 'content'), ['onlyContent']);
		});

		it('applies treeExclude to the tree scope only', () => {
			assert.deepEqual(buildPatterns(flags, noConfig, 'tree'), ['onlyTree']);
		});

		it('applies contentInclude to the content scope only', () => {
			const includeFlags = { contentInclude: ['node_modules'] };

			assert.ok(!buildPatterns(includeFlags, noConfig, 'content').includes('node_modules'));
			assert.ok(buildPatterns(includeFlags, noConfig, 'tree').includes('node_modules'));
		});

		it('applies treeInclude to the tree scope only', () => {
			const includeFlags = { treeInclude: ['node_modules'] };

			assert.ok(!buildPatterns(includeFlags, noConfig, 'tree').includes('node_modules'));
			assert.ok(buildPatterns(includeFlags, noConfig, 'content').includes('node_modules'));
		});
	});

	describe('include', () => {
		it('removes an included name from the default list and keeps the rest', () => {
			const patterns = buildPatterns({ include: ['.git'] }, noConfig, 'content');

			assert.ok(!patterns.includes('.git'));
			assert.ok(patterns.includes('.svn'));
		});

		it('removes a glob pattern when an included name matches it', () => {
			const patterns = buildPatterns({ include: ['debug.log'] }, noConfig, 'content');

			assert.ok(!patterns.includes('*.log'));
		});

		it('removes patterns that come from the config and from exclude as well', () => {
			const flags = { all: true, exclude: ['fromExclude'], include: ['fromConfig', 'fromExclude'] };

			const patterns = buildPatterns(flags, { ignore: ['fromConfig'] }, 'content');

			assert.deepEqual(patterns, []);
		});

		it('lets include win when the same name is also excluded', () => {
			const patterns = buildPatterns({ all: true, exclude: ['same'], include: ['same'] }, noConfig, 'content');

			assert.deepEqual(patterns, []);
		});
	});

	describe('duplicates', () => {
		it('lists a pattern once when the config repeats a default pattern', () => {
			const patterns = buildPatterns({}, { ignore: ['node_modules'] }, 'content');

			assert.equal(patterns.filter((pattern) => pattern === 'node_modules').length, 1);
		});

		it('lists a pattern once when it comes from several sources', () => {
			const flags = { all: true, exclude: ['same'], contentExclude: ['same'] };

			const patterns = buildPatterns(flags, { ignore: ['same'] }, 'content');

			assert.deepEqual(patterns, ['same']);
		});
	});
});
