import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { outputFileName, configFileName } from '../../src/shared/constants.js';
import { createTempProject, removeTempProject } from '../support/tempProject.js';
import { runCli } from '../support/runCli.js';

describe('non-interactive CLI flags', () => {
	let tmpDir;
	let projectDir;
	let outDir;
	let missingDir;

	function run(args, cwd = projectDir) {
		return runCli(args, cwd);
	}

	function outputExistsIn(directory) {
		return fs.existsSync(path.join(directory, outputFileName));
	}

	beforeEach(() => {
		tmpDir = createTempProject({ 'project/a.js': "console.log('hi');\n", 'out/': '' });
		projectDir = path.join(tmpDir, 'project');
		outDir = path.join(tmpDir, 'out');
		missingDir = path.join(tmpDir, 'does-not-exist');
	});

	afterEach(() => removeTempProject(tmpDir));

	describe('-n / --non-interactive', () => {
		it('uses the defaults and writes the output in the current folder when no other flag is passed', () => {
			const result = run(['-n']);

			assert.equal(result.status, 0);
			assert.ok(outputExistsIn(projectDir));
			assert.match(fs.readFileSync(path.join(projectDir, outputFileName), 'utf8'), /a\.js/);
		});

		it('does not create a config file when -C/--create-config is not passed', () => {
			run(['-n']);

			assert.equal(fs.existsSync(path.join(projectDir, configFileName)), false);
		});

		it('creates the config file when -C/--create-config is passed', () => {
			const result = run(['-n', '-C']);

			assert.equal(result.status, 0);
			assert.ok(fs.existsSync(path.join(projectDir, configFileName)));
		});

		// Running from the parent folder makes the "./" defaults point to the wrong place.
		it('writes the output of the --dp project into the -o folder', () => {
			const result = run(['-n', '--dp', projectDir, '-o', outDir], tmpDir);

			assert.equal(result.status, 0);
			assert.ok(outputExistsIn(outDir));
			assert.equal(outputExistsIn(tmpDir), false);
			assert.equal(outputExistsIn(projectDir), false);
		});

		it('fails with "Directory not found" and writes nothing when the -o folder does not exist', () => {
			const result = run(['-n', '-o', missingDir]);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /Directory not found/);
			assert.equal(outputExistsIn(projectDir), false);
		});

		it('fails with "Directory not found" when the --dp folder does not exist', () => {
			const result = run(['-n', '--dp', missingDir]);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /Directory not found/);
		});

		it('fails with "isn\'t a directory" when --dp points to a file', () => {
			const filePath = path.join(projectDir, 'a.js');

			const result = run(['-n', '--dp', filePath]);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /isn't a directory/);
		});

		it('prints the result and writes no file when -s and -p are passed', () => {
			const result = run(['-n', '-s', '-p']);

			assert.equal(result.status, 0);
			assert.match(result.stdout, /a\.js/);
			assert.equal(outputExistsIn(projectDir), false);
		});

		// The exit code is not asserted: -c needs a system clipboard, which CI machines often lack.
		it('writes no file when -s -c is passed', () => {
			const result = run(['-n', '-s', '-c']);

			assert.doesNotMatch(result.stderr, /Directory not found/);
			assert.equal(outputExistsIn(projectDir), false);
		});

		it('does not overwrite an existing config file when -C/--create-config is passed', () => {
			const configPath = path.join(projectDir, configFileName);
			const originalConfig = 'ignore = ["custom-folder"]\n';
			fs.writeFileSync(configPath, originalConfig);

			const result = run(['-n', '-C']);

			assert.equal(result.status, 0);
			assert.equal(fs.readFileSync(configPath, 'utf8'), originalConfig);
		});
	});

	describe('-D / --default', () => {
		it('uses the defaults and writes the output in the current folder', () => {
			const result = run(['-D']);

			assert.equal(result.status, 0);
			assert.ok(outputExistsIn(projectDir));
		});

		for (const [flagName, extraArgs] of [
			['-o', ['-o', '.']],
			['--dp', ['--dp', '.']],
			['-C', ['-C']],
		]) {
			it(`rejects ${flagName} even when it is written before -D`, () => {
				const result = run([...extraArgs, '-D']);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /cannot be used with/);
				assert.equal(outputExistsIn(projectDir), false);
			});
		}

		it('still runs as -D and writes the output when -n and -D are both passed', () => {
			const result = run(['-n', '-D']);

			assert.equal(result.status, 0);
			assert.ok(outputExistsIn(projectDir));
		});

		it('still rejects -o when -n is passed together with -D', () => {
			const result = run(['-n', '-D', '-o', outDir]);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /cannot be used with/);
		});
	});

	describe('removed -y / --yes flag', () => {
		for (const flagName of ['-y', '--yes']) {
			it(`rejects ${flagName} as an unknown option since -D replaced it`, () => {
				const result = run([flagName]);

				assert.equal(result.status, 1);
				assert.match(result.stderr, /unknown option/);
			});
		}
	});
});
