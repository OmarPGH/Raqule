import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { outputFileName, configFileName } from '../../src/shared/constants.js';

const cliPath = fileURLToPath(new URL('../../bin/cli.js', import.meta.url));

describe('non-interactive CLI flags', () => {
	let tmpDir;
	let projectDir;
	let outDir;
	let missingDir;

	// Closed stdin makes an unexpected prompt fail fast instead of hanging.
	function runCli(args, cwd = projectDir) {
		return spawnSync(process.execPath, [cliPath, ...args], {
			cwd,
			input: '',
			encoding: 'utf8',
			timeout: 15000,
		});
	}

	function outputExistsIn(directory) {
		return fs.existsSync(path.join(directory, outputFileName));
	}

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'raqule-cli-test-'));
		projectDir = path.join(tmpDir, 'project');
		outDir = path.join(tmpDir, 'out');
		missingDir = path.join(tmpDir, 'does-not-exist');
		fs.mkdirSync(projectDir);
		fs.mkdirSync(outDir);
		fs.writeFileSync(path.join(projectDir, 'a.js'), "console.log('hi');\n");
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	describe('-n / --non-interactive', () => {
		it('uses the defaults and writes the output in the current folder when no other flag is passed', () => {
			const result = runCli(['-n']);

			assert.equal(result.status, 0);
			assert.ok(outputExistsIn(projectDir));
			assert.match(fs.readFileSync(path.join(projectDir, outputFileName), 'utf8'), /a\.js/);
		});

		it('does not create a config file when -C/--create-config is not passed', () => {
			runCli(['-n']);

			assert.equal(fs.existsSync(path.join(projectDir, configFileName)), false);
		});

		it('creates the config file when -C/--create-config is passed', () => {
			const result = runCli(['-n', '-C']);

			assert.equal(result.status, 0);
			assert.ok(fs.existsSync(path.join(projectDir, configFileName)));
		});

		// Running from the parent folder makes the "./" defaults point to the wrong place.
		it('writes the output of the --dp project into the -o folder', () => {
			const result = runCli(['-n', '--dp', projectDir, '-o', outDir], tmpDir);

			assert.equal(result.status, 0);
			assert.ok(outputExistsIn(outDir));
			assert.equal(outputExistsIn(tmpDir), false);
			assert.equal(outputExistsIn(projectDir), false);
		});

		it('fails with "Directory not found" and writes nothing when the -o folder does not exist', () => {
			const result = runCli(['-n', '-o', missingDir]);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /Directory not found/);
			assert.equal(outputExistsIn(projectDir), false);
		});

		it('fails with "Directory not found" when the --dp folder does not exist', () => {
			const result = runCli(['-n', '--dp', missingDir]);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /Directory not found/);
		});

		it('fails with "isn\'t a directory" when --dp points to a file', () => {
			const filePath = path.join(projectDir, 'a.js');

			const result = runCli(['-n', '--dp', filePath]);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /isn't a directory/);
		});

		it('rejects -o when -s is also passed because they conflict', () => {
			const result = runCli(['-n', '-o', missingDir, '-s', '-p']);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /cannot be used with/);
			assert.equal(outputExistsIn(projectDir), false);
		});

		it('prints the result and writes no file when -s and -p are passed', () => {
			const result = runCli(['-n', '-s', '-p']);

			assert.equal(result.status, 0);
			assert.match(result.stdout, /a\.js/);
			assert.equal(outputExistsIn(projectDir), false);
		});

		it('fails when -s is used without -c or -p', () => {
			const result = runCli(['-n', '-s']);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /skip-save requires -c\/--copy or -p\/--print/);
		});

		// The exit code is not asserted: -c needs a system clipboard, which CI machines often lack.
		it('writes no file when -s -c is passed', () => {
			const result = runCli(['-n', '-s', '-c']);

			assert.doesNotMatch(result.stderr, /Directory not found/);
			assert.equal(outputExistsIn(projectDir), false);
		});

		it('does not overwrite an existing config file when -C/--create-config is passed', () => {
			const configPath = path.join(projectDir, configFileName);
			const originalConfig = 'ignore = ["custom-folder"]\n';
			fs.writeFileSync(configPath, originalConfig);

			const result = runCli(['-n', '-C']);

			assert.equal(result.status, 0);
			assert.equal(fs.readFileSync(configPath, 'utf8'), originalConfig);
		});
	});

	describe('-D / --default', () => {
		it('uses the defaults and writes the output in the current folder', () => {
			const result = runCli(['-D']);

			assert.equal(result.status, 0);
			assert.ok(outputExistsIn(projectDir));
		});

		for (const [flagName, extraArgs] of [
			['-o', ['-o', '.']],
			['--dp', ['--dp', '.']],
			['-C', ['-C']],
		]) {
			it(`rejects ${flagName} with an error and a non-zero exit code`, () => {
				const result = runCli(['-D', ...extraArgs]);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /cannot be used with/);
				assert.equal(outputExistsIn(projectDir), false);
			});
		}

		for (const [flagName, extraArgs] of [
			['-o', ['-o', '.']],
			['--dp', ['--dp', '.']],
			['-C', ['-C']],
		]) {
			it(`rejects ${flagName} even when it is written before -D`, () => {
				const result = runCli([...extraArgs, '-D']);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /cannot be used with/);
				assert.equal(outputExistsIn(projectDir), false);
			});
		}

		it('warns that -n is redundant and still runs as -D when both are passed', () => {
			const result = runCli(['-n', '-D']);

			assert.equal(result.status, 0);
			assert.match(result.stderr, /redundant/);
			assert.ok(outputExistsIn(projectDir));
		});

		it('still rejects -o when -n is passed together with -D', () => {
			const result = runCli(['-n', '-D', '-o', outDir]);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /cannot be used with/);
		});
	});

	describe('removed -y / --yes flag', () => {
		for (const flagName of ['-y', '--yes']) {
			it(`rejects ${flagName} as an unknown option since -D replaced it`, () => {
				const result = runCli([flagName]);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /unknown option/);
			});
		}
	});
});
