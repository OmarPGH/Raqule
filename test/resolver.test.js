import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { IgnoreResolver } from '../src/ignore/resolver.js';
import { defaultIgnoreList } from '../src/ignore/index.js';

const EXTGLOB_NEGATION_PATTERN = /^(.*)!\((.+)\)(.*)$/;

function isIgnored(resolver, name) {
	const exampleName = name.split('').map((ele, index, arr) => {
		if (ele === '*' && arr[index + 1] !== '*') {
			if (index !== 0 && arr[index - 1] !== '.') {
				return '.Something';
			} else {
				return 'Something';
			}
		} else {
			return ele;
		}
	}).join('');
	console.log(exampleName);
  	return resolver.isIgnored(exampleName, exampleName) && resolver.isIgnored(`folderOne/folderTwo/${exampleName}`, exampleName);
}

function checkIsIgnored(resolver, name) {
	it(`Ignores ${name}`, () => {
		assert.ok(isIgnored(resolver, name));
	});
}

function checkIsNotIgnored(resolver, name) {
    it(`Doesn't ignore ${name}`, () => {
  		assert.ok(!isIgnored(resolver, name));
  	});
}

function checkPattern(resolver, pattern) {
	const match = pattern.match(EXTGLOB_NEGATION_PATTERN);

	if (!match) {
		checkIsIgnored(resolver, pattern);
		return;
	}

	const [, base, optionsGroup, suffix] = match;
	checkIsIgnored(resolver, base);

	for (const option of optionsGroup.split('|')) {
		checkIsNotIgnored(resolver, `${base}${option}${suffix}`);
	}
}

function checkGroups(resolver, groups) {
	for (const [groupName, patterns] of Object.entries(groups)) {
		describe(groupName, () => {
			for (const pattern of patterns) {
				checkPattern(resolver, pattern);
			}
		});
	}
}

describe('Default ignore system', () => {
  const resolver = new IgnoreResolver({}, { ignore: [] });
  checkGroups(resolver, defaultIgnoreList);
});