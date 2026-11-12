import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('index.js barrels', () => {
	for (const [folder, expectedNames] of [
		['config', ['config']],
		['core', ['gather', 'generateTree']],
		['helpers', ['specialFileHandler']],
		['ignore', ['IgnoreResolver', 'defaultIgnoreList', 'flatDefaultIgnoreList']],
		['input', ['buildAskAbout', 'readFlags']],
		['shared', ['configFileName', 'configurationDefault', 'outputFileName']],
		['utils', ['clipboardWrite', 'countTokens', 'formatFiles', 'formatFinal', 'formatTree']],
		['validation', ['validateDirectory']],
	]) {
		it(`exports exactly ${expectedNames.join(', ')} from src/${folder}`, async () => {
			const barrel = await import(`../src/${folder}/index.js`);

			assert.deepEqual(Object.keys(barrel).sort(), expectedNames);
		});
	}

	it('exports only main from src/main.js', async () => {
		const entry = await import('../src/main.js');

		assert.deepEqual(Object.keys(entry), ['main']);
	});
});
