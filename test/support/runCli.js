import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cliPath = fileURLToPath(new URL('../../bin/cli.js', import.meta.url));

// Closed stdin makes an unexpected prompt fail fast instead of hanging.
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
