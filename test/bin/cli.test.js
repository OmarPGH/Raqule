import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createTempProject, removeTempProject } from '../support/tempProject.js';
import { runCli } from '../support/runCli.js';

const cliUrl = new URL('../../bin/cli.js', import.meta.url);
const packageVersion = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version;

describe('bin/cli.js', () => {
	let projectDir;

	afterEach(() => removeTempProject(projectDir));

	function run(args) {
		projectDir = createTempProject({ 'index.js': 'let x = 1;' });

		return runCli(args, projectDir);
	}

	it('starts with a node shebang so it can run as a command', () => {
		const firstLine = fs.readFileSync(cliUrl, 'utf8').split('\n')[0];

		assert.equal(firstLine, '#!/usr/bin/env node');
	});

	it('is the file the rql command points to in package.json', () => {
		const { bin } = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

		assert.equal(bin.rql, './bin/cli.js');
	});

	it('exits with code 0 when the run succeeds', () => {
		const result = run(['-D', '-s', '-p']);

		assert.equal(result.status, 0);
	});

	it('prints the package version and exits with code 0 for --version', () => {
		const result = run(['--version']);

		assert.equal(result.status, 0);
		assert.equal(result.stdout.trim(), packageVersion);
	});

	it('prints the usage and exits with code 0 for --help', () => {
		const result = run(['--help']);

		assert.equal(result.status, 0);
		assert.match(result.stdout, /Usage: \S+ \[options\]/);
	});

	it('exits with code 1 and prints the error message on stderr when the run fails', () => {
		const result = run(['-n', '--dp', 'does-not-exist']);

		assert.equal(result.status, 1);
		assert.match(result.stderr, /Directory not found/);
	});

	it('prints only the error message without a stack trace when the run fails', () => {
		const result = run(['-n', '--dp', 'does-not-exist']);

		assert.doesNotMatch(result.stderr, /\n\s+at /);
	});

	it('writes nothing to stdout about success when the run fails', () => {
		const result = run(['-n', '--dp', 'does-not-exist']);

		assert.doesNotMatch(result.stdout, /You'll find/);
	});
});
