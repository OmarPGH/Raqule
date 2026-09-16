import { program, InvalidArgumentError } from 'commander';
import { packageInfo } from './packageInfo.js';

function parseDepth(value) {
	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed < 1) {
		throw new InvalidArgumentError('Depth must be a whole number of 1 or greater.');
	}

	return parsed;
}

async function readFlags() {
	program
		.description(packageInfo.description)
		.version(packageInfo.version)
		.option('-a, --all', 'Collect all files & directories including [.git, node_modules, target, etc] Not Recommended')
		.option('-d, --depth <number>', 'Select max depth', parseDepth, Infinity)
		.option('-t, --tree', 'Generate only the project directory tree without bundling file contents')
		.option('-p, --print', 'Print the result (context.md content) in the Terminal')
		.option('-P, --printOnly', 'Print the result (context.md content) in the Terminal and delete it (context.md) after printing it')

	program.parse(process.argv);

	return program.opts();
}

export { readFlags };
