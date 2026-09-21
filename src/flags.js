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
		.option('-e, --exclude <string...>', 'excludes unwanted files/folders')
		.option('--ce, --content-exclude <string...>', 'excludes unwanted files/folders from the contents')
		.option('--te, --tree-exclude <string...>', 'excludes unwanted folders from the tree')
		.option('-i, --include <string...>', 'includes wanted files/folders, even if they are excluded by default or manual')
		.option('--ci, --content-include <string...>', 'includes wanted files/folders to the contents, even if they are excluded by default or manual')
		.option('--ti, --tree-include <string...>', 'includes wanted folders to the tree, even if they are excluded by default or manual')
		.option('-p, --print', 'Print the result (context.md content) in the Terminal')
		.option('-P, --printOnly', 'Print the result (context.md content) in the Terminal and delete it (context.md) after printing it')
		.option('-t, --tree', 'Generate only the project directory tree without bundling file contents')

	program.parse(process.argv);

	return program.opts();
}

export { readFlags };
