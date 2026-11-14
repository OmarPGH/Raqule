import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runNode } from '../support/runCli.js';

const flagsModuleUrl = new URL('../../src/input/flags.js', import.meta.url).href;

// readFlags uses commander's shared program, so each case needs a fresh process.
// The placeholder fills the script slot commander skips when reading argv.
const runnerScript = `
import { readFlags } from ${JSON.stringify(flagsModuleUrl)};
process.argv.splice(1, 0, 'rql');
console.log(JSON.stringify(readFlags(), (key, value) => (value === Infinity ? 'Infinity' : value)));
`;

function runReadFlags(args) {
	return runNode(['--input-type=module', '-e', runnerScript, '--', ...args]);
}

function flagsFrom(args) {
	const result = runReadFlags(args);

	assert.equal(result.status, 0, result.stderr);

	return JSON.parse(result.stdout);
}

describe('readFlags', () => {
	describe('defaults', () => {
		it('sets only an unlimited depth when no flag is passed', () => {
			assert.deepEqual(flagsFrom([]), { depth: 'Infinity' });
		});
	});

	describe('boolean flags', () => {
		for (const [shortFlag, longFlag, key] of [
			['-a', '--all', 'all'],
			['-c', '--copy', 'copy'],
			['-C', '--create-config', 'createConfig'],
			['-p', '--print', 'print'],
			['-t', '--tree', 'tree'],
			['-T', '--tokens', 'tokens'],
			['-n', '--non-interactive', 'nonInteractive'],
			['-D', '--default', 'default'],
		]) {
			it(`sets ${key} to true for ${shortFlag} and ${longFlag}`, () => {
				assert.equal(flagsFrom([shortFlag])[key], true);
				assert.equal(flagsFrom([longFlag])[key], true);
			});
		}
	});

	describe('depth', () => {
		for (const [value, expected] of [
			['1', 1],
			['3', 3],
			['infinity', 'Infinity'],
			['INF', 'Infinity'],
			['Max', 'Infinity'],
			['Infinity', 'Infinity'],
		]) {
			it(`reads -d ${value} as ${expected}`, () => {
				assert.equal(flagsFrom(['-d', value]).depth, expected);
			});
		}

		for (const value of ['0', '-1', '1.5', 'abc', '']) {
			it(`rejects -d "${value}" with an explanation`, () => {
				const result = runReadFlags(['-d', value]);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /Depth must be a whole number of 1 or greater/);
			});
		}
	});

	describe('max', () => {
		it('reads -m as a number', () => {
			assert.equal(flagsFrom(['-m', '5000']).max, 5000);
		});

		for (const value of ['0', '-5', '2.5', 'abc', '']) {
			it(`rejects -m "${value}" with an explanation`, () => {
				const result = runReadFlags(['-m', value]);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /Max must be a whole number of 1 or greater/);
			});
		}
	});

	describe('value flags', () => {
		it('reads the directory path from --dp', () => {
			assert.equal(flagsFrom(['--dp', './project']).directoryPath, './project');
		});

		it('reads the output folder from -o', () => {
			assert.equal(flagsFrom(['-o', './out']).output, './out');
		});

		for (const [flagName, key] of [
			['-e', 'exclude'],
			['--ce', 'contentExclude'],
			['--te', 'treeExclude'],
			['-i', 'include'],
			['--ci', 'contentInclude'],
			['--ti', 'treeInclude'],
		]) {
			it(`collects several patterns after ${flagName} into ${key}`, () => {
				assert.deepEqual(flagsFrom([flagName, 'one', 'two', 'three'])[key], ['one', 'two', 'three']);
			});
		}
	});

	describe('conflicts and requirements', () => {
		for (const [flagName, extraArgs] of [
			['--ce', ['--ce', 'x']],
			['--ci', ['--ci', 'x']],
		]) {
			it(`rejects -t together with ${flagName}`, () => {
				const result = runReadFlags(['-t', ...extraArgs]);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /cannot be used with/);
			});
		}

		it('accepts -t together with the tree-only and shared patterns', () => {
			const flags = flagsFrom(['-t', '--te', 'x', '--ti', 'y', '-e', 'z']);

			assert.equal(flags.tree, true);
		});

		for (const [flagName, extraArgs] of [
			['-o', ['-o', '.']],
			['--dp', ['--dp', '.']],
			['-C', ['-C']],
		]) {
			it(`rejects -D together with ${flagName}`, () => {
				const result = runReadFlags(['-D', ...extraArgs]);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /cannot be used with/);
			});
		}

		it('rejects -s together with -o', () => {
			const result = runReadFlags(['-s', '-p', '-o', '.']);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /cannot be used with/);
		});

		it('rejects -s alone because the result would have nowhere to go', () => {
			const result = runReadFlags(['-s']);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /skip-save requires -c\/--copy or -p\/--print/);
		});

		for (const destinationFlag of ['-c', '-p']) {
			it(`accepts -s when ${destinationFlag} gives the result somewhere to go`, () => {
				assert.equal(flagsFrom(['-s', destinationFlag]).skipSave, true);
			});
		}
	});

	describe('warnings and unknown flags', () => {
		it('warns that -n is redundant when -D is also used, and keeps both flags', () => {
			const result = runReadFlags(['-n', '-D']);

			assert.equal(result.status, 0);
			assert.match(result.stderr, /redundant/);
			assert.deepEqual(
				[JSON.parse(result.stdout).nonInteractive, JSON.parse(result.stdout).default],
				[true, true],
			);
		});

		it('does not warn about redundancy when -n is used without -D', () => {
			const result = runReadFlags(['-n']);

			assert.equal(result.status, 0);
			assert.equal(result.stderr, '');
		});

		it('rejects an unknown flag', () => {
			const result = runReadFlags(['--not-a-real-flag']);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /unknown option/);
		});
	});});
