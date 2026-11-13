import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { outputFileName, configFileName } from '../src/shared/constants.js';
import { createTempProject, removeTempProject } from './support/tempProject.js';
import { runCli } from './support/runCli.js';

const sampleFiles = {
	'README.md': '# Sample',
	'src/app.js': "console.log('app');",
	'node_modules/lib/index.js': 'module.exports = 1;',
};

describe('main', () => {
	let projectDir;

	afterEach(() => removeTempProject(projectDir));

	function run(args, files = sampleFiles) {
		projectDir = createTempProject(files);

		return runCli(args, projectDir);
	}

	function outputFileIn(directory) {
		return path.join(directory, outputFileName);
	}

	function estimatedTokensOf(result) {
		return Number(result.stdout.match(/Estimated Total Tokens: ([\d,]+)/)[1].replaceAll(',', ''));
	}

	describe('printing the result', () => {
		it('prints the project tree and the content of every file with -p', () => {
			const result = run(['-D', '-s', '-p']);

			assert.equal(result.status, 0);
			assert.match(result.stdout, /Project Tree:/);
			assert.match(result.stdout, /README\.md Content :/);
			assert.match(result.stdout, /src\/app\.js Content :/);
			assert.match(result.stdout, /console\.log\('app'\);/);
		});

		it('tells the user the result is above after printing it', () => {
			const result = run(['-D', '-s', '-p']);

			assert.match(result.stdout, /The Result is Above/);
		});

		it('prints only the tree without file contents with -t', () => {
			const result = run(['-D', '-s', '-p', '-t']);

			assert.match(result.stdout, /└── app\.js/);
			assert.doesNotMatch(result.stdout, /Content :/);
		});

		it('prints nothing of the result when -p is not passed', () => {
			const result = run(['-D']);

			assert.equal(result.status, 0);
			assert.doesNotMatch(result.stdout, /Project Tree:/);
			assert.doesNotMatch(result.stdout, /The Result is Above/);
		});
	});

	describe('saving the result', () => {
		it('saves the output file in the current folder by default and tells where it is', () => {
			const result = run(['-D']);

			assert.equal(result.status, 0);
			assert.ok(fs.existsSync(outputFileIn(projectDir)));
			assert.match(result.stdout, new RegExp(`You'll find ${outputFileName} file at`));
		});

		it('saves the tree and the file contents in the output file', () => {
			run(['-D']);

			const saved = fs.readFileSync(outputFileIn(projectDir), 'utf8');

			assert.match(saved, /Project Tree:/);
			assert.match(saved, /src\/app\.js Content :/);
		});

		it('saves only the tree in the output file with -t', () => {
			run(['-D', '-t']);

			const saved = fs.readFileSync(outputFileIn(projectDir), 'utf8');

			assert.match(saved, /Project Tree:/);
			assert.doesNotMatch(saved, /Content :/);
		});	});

	describe('counting tokens', () => {
		it('prints the estimated total tokens with -T', () => {
			const result = run(['-D', '-s', '-p', '-T']);

			assert.match(result.stdout, /Estimated Total Tokens: [\d,]+/);
		});

		it('prints no token count when neither -T nor --max is passed', () => {
			const result = run(['-D']);

			assert.equal(result.status, 0);
			assert.doesNotMatch(result.stdout, /Estimated Total Tokens/);
		});

		it('prints the token count and that it is below the limit when --max is not exceeded', () => {
			const result = run(['-D', '-s', '-p', '--max', '1000000']);

			assert.equal(result.status, 0);
			assert.match(result.stdout, /Below the maximum allowed number of tokens \(1000000\)/);
			assert.match(result.stdout, /Estimated Total Tokens: [\d,]+/);
		});

		it('fails with the limit in the message when --max is exceeded', () => {
			const result = run(['-D', '--max', '1']);

			assert.equal(result.status, 1);
			assert.match(result.stderr, /exceeds the specified maximum limit \(1\)/);
		});

		it('saves no file when --max is exceeded', () => {
			run(['-D', '--max', '1']);

			assert.equal(fs.existsSync(outputFileIn(projectDir)), false);
		});

		it('accepts a result whose token count equals --max exactly', () => {
			projectDir = createTempProject(sampleFiles);
			const exactCount = estimatedTokensOf(runCli(['-D', '-s', '-p', '-T'], projectDir));

			const atLimit = runCli(['-D', '-s', '-p', '--max', String(exactCount)], projectDir);
			const belowLimit = runCli(['-D', '-s', '-p', '--max', String(exactCount - 1)], projectDir);

			assert.equal(atLimit.status, 0);
			assert.equal(belowLimit.status, 1);
		});
	});

	describe('applying flags to the gathered project', () => {
		it('skips the default ignore list entries such as node_modules in the contents', () => {
			const result = run(['-D', '-s', '-p']);

			assert.match(result.stdout, /src\/app\.js Content :/);
			assert.doesNotMatch(result.stdout, /node_modules\/lib\/index\.js Content :/);
		});

		it('includes the default ignored entries with -a', () => {
			const result = run(['-D', '-s', '-p', '-a']);

			assert.match(result.stdout, /node_modules\/lib\/index\.js Content :/);
		});

		it('leaves out the content of files matched by -e', () => {
			const result = run(['-D', '-s', '-p', '-e', 'README.md']);

			assert.doesNotMatch(result.stdout, /README\.md Content :/);
			assert.match(result.stdout, /src\/app\.js Content :/);
		});

		it('leaves out files deeper than -d', () => {
			const result = run(['-D', '-s', '-p', '-d', '1']);

			assert.match(result.stdout, /README\.md Content :/);
			assert.doesNotMatch(result.stdout, /src\/app\.js Content :/);
		});
	});

	describe('using the config file', () => {
		it('leaves out the entries listed in the ignore list of the config file', () => {
			const result = run(['-D', '-s', '-p'], {
				...sampleFiles,
				[configFileName]: 'ignore = ["README.md"]\n',
			});

			assert.doesNotMatch(result.stdout, /README\.md Content :/);
			assert.match(result.stdout, /src\/app\.js Content :/);
		});

		it('fails with a syntax error when the config file is not valid TOML', () => {
			const result = run(['-D'], { ...sampleFiles, [configFileName]: 'ignore = [unclosed' });

			assert.equal(result.status, 1);
			assert.match(result.stderr, /Syntax Error/);
		});

		it('fails with a config error when the config file does not match the schema', () => {
			const result = run(['-D'], { ...sampleFiles, [configFileName]: 'ignore = "README.md"\n' });

			assert.equal(result.status, 1);
			assert.match(result.stderr, /Config error at:/);
		});
	});

	describe('asking for the directory', () => {
		it('gathers the --dp folder instead of the current one', () => {
			projectDir = createTempProject({ 'target/inner.js': 'let inner = 1;' });

			const result = runCli(['-n', '-s', '-p', '--dp', path.join(projectDir, 'target')], projectDir);

			assert.match(result.stdout, /inner\.js Content :/);
		});

		it('gathers a --dp folder whose name has spaces and unicode characters', () => {
			projectDir = createTempProject({ 'my project ملف/inner.js': 'let inner = 1;' });

			const result = runCli(['-n', '-s', '-p', '--dp', path.join(projectDir, 'my project ملف')], projectDir);

			assert.equal(result.status, 0);
			assert.match(result.stdout, /inner\.js Content :/);
		});

		it('tells which directory path was selected when a prompt is skipped', () => {
			const result = run(['-D', '-s', '-p']);

			assert.match(result.stdout, /Your directory path :\n"\.\/" has been selected as the default/);
		});
	});
});
