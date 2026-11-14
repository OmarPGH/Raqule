import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { outputFileName, configFileName } from '../src/shared/constants.js';
import { createTempProject, removeTempProject } from './support/tempProject.js';
import { runCli, useCliRun } from './support/runCli.js';

const sampleFiles = {
	'README.md': '# Sample',
	'src/app.js': "console.log('app');",
	'node_modules/lib/index.js': 'module.exports = 1;',
};

describe('main', () => {
	const printed = useCliRun(['-D', '-s', '-p'], sampleFiles);
	const savedByDefault = useCliRun(['-D'], sampleFiles);
	const treeOnly = useCliRun(['-D', '-p', '-t'], sampleFiles);

	function outputFileIn(directory) {
		return path.join(directory, outputFileName);
	}

	function estimatedTokensOf(result) {
		return Number(result.stdout.match(/Estimated Total Tokens: ([\d,]+)/)[1].replaceAll(',', ''));
	}

	describe('printing the result', () => {
		it('prints the project tree and the content of every file with -p', () => {
			assert.equal(printed.status, 0);
			assert.match(printed.stdout, /Project Tree:/);
			assert.match(printed.stdout, /README\.md Content :/);
			assert.match(printed.stdout, /src\/app\.js Content :/);
			assert.match(printed.stdout, /console\.log\('app'\);/);
		});

		it('tells the user the result is above after printing it', () => {
			assert.match(printed.stdout, /The Result is Above/);
		});

		it('prints only the tree without file contents with -t', () => {
			assert.match(treeOnly.stdout, /└── app\.js/);
			assert.doesNotMatch(treeOnly.stdout, /Content :/);
		});

		it('prints nothing of the result when -p is not passed', () => {
			assert.equal(savedByDefault.status, 0);
			assert.doesNotMatch(savedByDefault.stdout, /Project Tree:/);
			assert.doesNotMatch(savedByDefault.stdout, /The Result is Above/);
		});
	});

	describe('saving the result', () => {
		it('saves the output file in the current folder by default and tells where it is', () => {
			assert.equal(savedByDefault.status, 0);
			assert.ok(fs.existsSync(outputFileIn(savedByDefault.projectDir)));
			assert.match(savedByDefault.stdout, new RegExp(`You'll find ${outputFileName} file at`));
		});

		it('saves the tree and the file contents in the output file', () => {
			const saved = fs.readFileSync(outputFileIn(savedByDefault.projectDir), 'utf8');

			assert.match(saved, /Project Tree:/);
			assert.match(saved, /src\/app\.js Content :/);
		});

		it('saves only the tree in the output file with -t', () => {
			const saved = fs.readFileSync(outputFileIn(treeOnly.projectDir), 'utf8');

			assert.match(saved, /Project Tree:/);
			assert.doesNotMatch(saved, /Content :/);
		});
	});

	describe('counting tokens', () => {
		const counted = useCliRun(['-D', '-s', '-p', '-T'], sampleFiles);
		const belowMax = useCliRun(['-D', '-s', '-p', '--max', '1000000'], sampleFiles);
		const aboveMax = useCliRun(['-D', '--max', '1'], sampleFiles);

		it('prints the estimated total tokens with -T', () => {
			assert.match(counted.stdout, /Estimated Total Tokens: [\d,]+/);
		});

		it('prints no token count when neither -T nor --max is passed', () => {
			assert.equal(savedByDefault.status, 0);
			assert.doesNotMatch(savedByDefault.stdout, /Estimated Total Tokens/);
		});

		it('prints the token count and that it is below the limit when --max is not exceeded', () => {
			assert.equal(belowMax.status, 0);
			assert.match(belowMax.stdout, /Below the maximum allowed number of tokens \(1000000\)/);
			assert.match(belowMax.stdout, /Estimated Total Tokens: [\d,]+/);
		});

		it('fails with the limit in the message when --max is exceeded', () => {
			assert.equal(aboveMax.status, 1);
			assert.match(aboveMax.stderr, /exceeds the specified maximum limit \(1\)/);
		});

		it('saves no file when --max is exceeded', () => {
			assert.equal(fs.existsSync(outputFileIn(aboveMax.projectDir)), false);
		});

		it('accepts a result whose token count equals --max exactly', () => {
			const exactCount = estimatedTokensOf(counted);

			const atLimit = runCli(['-D', '-s', '-p', '--max', String(exactCount)], counted.projectDir);
			const belowLimit = runCli(['-D', '-s', '-p', '--max', String(exactCount - 1)], counted.projectDir);

			assert.equal(atLimit.status, 0);
			assert.equal(belowLimit.status, 1);
		});
	});

	describe('applying flags to the gathered project', () => {
		const withAll = useCliRun(['-D', '-s', '-p', '-a'], sampleFiles);
		const withExclude = useCliRun(['-D', '-s', '-p', '-e', 'README.md'], sampleFiles);
		const withDepth = useCliRun(['-D', '-s', '-p', '-d', '1'], sampleFiles);

		it('skips the default ignore list entries such as node_modules in the contents', () => {
			assert.match(printed.stdout, /src\/app\.js Content :/);
			assert.doesNotMatch(printed.stdout, /node_modules\/lib\/index\.js Content :/);
		});

		it('includes the default ignored entries with -a', () => {
			assert.match(withAll.stdout, /node_modules\/lib\/index\.js Content :/);
		});

		it('leaves out the content of files matched by -e', () => {
			assert.doesNotMatch(withExclude.stdout, /README\.md Content :/);
			assert.match(withExclude.stdout, /src\/app\.js Content :/);
		});

		it('leaves out files deeper than -d', () => {
			assert.match(withDepth.stdout, /README\.md Content :/);
			assert.doesNotMatch(withDepth.stdout, /src\/app\.js Content :/);
		});
	});

	describe('using the config file', () => {
		const withIgnoreList = useCliRun(['-D', '-s', '-p'], { ...sampleFiles, [configFileName]: 'ignore = ["README.md"]\n' });
		const withBrokenToml = useCliRun(['-D'], { ...sampleFiles, [configFileName]: 'ignore = [unclosed' });
		const withWrongSchema = useCliRun(['-D'], { ...sampleFiles, [configFileName]: 'ignore = "README.md"\n' });

		it('leaves out the entries listed in the ignore list of the config file', () => {
			assert.doesNotMatch(withIgnoreList.stdout, /README\.md Content :/);
			assert.match(withIgnoreList.stdout, /src\/app\.js Content :/);
		});

		it('fails with a syntax error when the config file is not valid TOML', () => {
			assert.equal(withBrokenToml.status, 1);
			assert.match(withBrokenToml.stderr, /Syntax Error/);
		});

		it('fails with a config error when the config file does not match the schema', () => {
			assert.equal(withWrongSchema.status, 1);
			assert.match(withWrongSchema.stderr, /Config error at:/);
		});
	});

	describe('asking for the directory', () => {
		let projectDir;

		afterEach(() => removeTempProject(projectDir));

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
			assert.match(printed.stdout, /Your directory path :\n"\.\/" has been selected as the default/);
		});
	});
});
