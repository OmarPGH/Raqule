import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { before, after } from 'node:test';
import { createTempProject, removeTempProject } from './tempProject.js';

const cliPath = fileURLToPath(new URL('../../bin/cli.js', import.meta.url));

// Closed stdin makes an unexpected prompt fail fast instead of hanging.
// The timeout is only a safety net so a stuck process cannot block the suite; a normal run takes under a second.
export function runNode(nodeArgs, cwd) {
	return spawnSync(process.execPath, nodeArgs, {
		cwd,
		input: '',
		encoding: 'utf8',
		timeout: 15000,
	});
}

export function runCli(args, cwd) {
	return runNode([cliPath, ...args], cwd);
}

// Starting a CLI process costs ~0.4s, so tests that only assert different parts of one run share it.
export function useCliRun(args, files) {
	const run = {};

	before(() => {
		const projectDir = createTempProject(files);

		Object.assign(run, runCli(args, projectDir), { projectDir });
	});

	after(() => removeTempProject(run.projectDir));

	return run;
}
