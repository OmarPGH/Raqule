import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { useCliRun } from '../support/runCli.js';

const cliUrl = new URL('../../bin/cli.js', import.meta.url);
const packageVersion = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version;
const project = { 'index.js': 'let x = 1;' };

describe('bin/cli.js', () => {
	const succeeded = useCliRun(['-D', '-s', '-p'], project);
	const versionRun = useCliRun(['--version'], project);
	const helpRun = useCliRun(['--help'], project);
	const failed = useCliRun(['-n', '--dp', 'does-not-exist'], project);

	it('starts with a node shebang so it can run as a command', () => {
		const firstLine = fs.readFileSync(cliUrl, 'utf8').split('\n')[0];

		assert.equal(firstLine, '#!/usr/bin/env node');
	});

	it('is the file the rql command points to in package.json', () => {
		const { bin } = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

		assert.equal(bin.rql, './bin/cli.js');
	});

	it('exits with code 0 when the run succeeds', () => {
		assert.equal(succeeded.status, 0);
	});

	it('prints the package version and exits with code 0 for --version', () => {
		assert.equal(versionRun.status, 0);
		assert.equal(versionRun.stdout.trim(), packageVersion);
	});

	it('prints the usage and exits with code 0 for --help', () => {
		assert.equal(helpRun.status, 0);
		assert.match(helpRun.stdout, /Usage: \S+ \[options\]/);
	});

	it('exits with code 1 and prints the error message on stderr when the run fails', () => {
		assert.equal(failed.status, 1);
		assert.match(failed.stderr, /Directory not found/);
	});

	it('prints only the error message without a stack trace when the run fails', () => {
		assert.doesNotMatch(failed.stderr, /\n\s+at /);
	});

	it('writes nothing to stdout about success when the run fails', () => {
		assert.doesNotMatch(failed.stdout, /You'll find/);
	});
});
