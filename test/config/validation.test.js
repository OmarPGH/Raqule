import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig } from '../../src/config/validation.js';

describe('validateConfig', () => {
	describe('valid configurations', () => {
		it('returns the same configuration when it has an empty ignore list', async () => {
			const configuration = { ignore: [] };

			const result = await validateConfig(configuration, '.');

			assert.equal(result, configuration);
		});

		it('returns the same configuration when the ignore list has patterns', async () => {
			const configuration = { ignore: ['dist', '*.log'] };

			const result = await validateConfig(configuration, '.');

			assert.deepEqual(result, { ignore: ['dist', '*.log'] });
		});

		it('keeps unknown keys instead of rejecting them', async () => {
			const configuration = { ignore: [], extra: 1 };

			const result = await validateConfig(configuration, '.');

			assert.deepEqual(result, { ignore: [], extra: 1 });
		});
	});

	describe('broken configuration', () => {
		it('throws a syntax error that mentions TOML when the configuration is "broken"', async () => {
			await assert.rejects(validateConfig('broken', '.'), /Syntax Error: You have a broken config file/);
		});

		it('tells the user how to recover from a broken file', async () => {
			await assert.rejects(validateConfig('broken', '.'), /delete it/);
		});
	});

	describe('invalid configurations', () => {
		for (const [description, configuration] of [
			['ignore is missing', {}],
			['ignore is a string', { ignore: 'dist' }],
			['ignore is an object', { ignore: { dist: true } }],
			['ignore holds a number', { ignore: [1] }],
			['the configuration is null', null],
			['the configuration is a string', 'ignore'],
		]) {
			it(`throws a config error when ${description}`, async () => {
				await assert.rejects(validateConfig(configuration, '.'), /^Error: Config error at:/);
			});
		}

		it('points to the path of the wrong item in the error', async () => {
			await assert.rejects(validateConfig({ ignore: ['dist', 2] }, '.'), /\[ignore\.1\]/);
		});

		it('reports every wrong item, not only the first one', async () => {
			await assert.rejects(validateConfig({ ignore: [1, 'dist', 3] }, '.'), (error) => {
				assert.match(error.message, /\[ignore\.0\]/);
				assert.match(error.message, /\[ignore\.2\]/);

				return true;
			});
		});
	});
});
