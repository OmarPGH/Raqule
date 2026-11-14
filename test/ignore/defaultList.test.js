import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { defaultIgnoreList, flatDefaultIgnoreList } from '../../src/ignore/defaultList.js';
import { outputFileName } from '../../src/shared/constants.js';

describe('defaultIgnoreList', () => {
	it('gives every group at least one pattern', () => {
		for (const [groupName, patterns] of Object.entries(defaultIgnoreList)) {
			assert.ok(Array.isArray(patterns) && patterns.length > 0, `${groupName} should not be empty`);
		}
	});

	it('only contains non-empty patterns without surrounding whitespace', () => {
		for (const pattern of flatDefaultIgnoreList) {
			assert.equal(typeof pattern, 'string');
			assert.ok(pattern.length > 0);
			assert.equal(pattern, pattern.trim());
		}
	});

	it('never lists the same pattern twice across groups', () => {
		assert.equal(new Set(flatDefaultIgnoreList).size, flatDefaultIgnoreList.length);
	});

	it('ignores the output file so Raqule never gathers its own previous output', () => {
		assert.deepEqual(defaultIgnoreList.raqule, [outputFileName]);
		assert.ok(flatDefaultIgnoreList.includes(outputFileName));
	});
});

describe('flatDefaultIgnoreList', () => {
	it('lists every group pattern in one flat list, in group order', () => {
		const expected = Object.values(defaultIgnoreList).reduce((all, patterns) => [...all, ...patterns], []);

		assert.deepEqual(flatDefaultIgnoreList, expected);
	});
});
