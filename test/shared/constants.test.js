import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { outputFileName, configFileName, configurationDefault } from '../../src/shared/constants.js';

describe('shared constants', () => {
	it('names the output file as a markdown file', () => {
		assert.match(outputFileName, /\.md$/);
	});

	it('names the config file as a toml file', () => {
		assert.match(configFileName, /\.toml$/);
	});

	it('uses plain file names without any folder part', () => {
		for (const fileName of [outputFileName, configFileName]) {
			assert.equal(fileName, fileName.split(/[\\/]/).pop());
		}
	});

	it('uses different names for the output file and the config file', () => {
		assert.notEqual(outputFileName, configFileName);
	});

	it('starts the default configuration with an empty ignore list', () => {
		assert.deepEqual(configurationDefault, { ignore: [] });
	});
});
