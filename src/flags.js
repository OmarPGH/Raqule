import { program } from 'commander';
import { packageInfo } from './packageInfo.js';

async function readFlags() {
	program
		.description(packageInfo.description)
		.version(packageInfo.version)
		.option('-a, --all', 'Collect all files & directories including [.git, node_modules]')
		.option('-d, --depth <number>', 'Select max depth')
		.option('-t, --tree', 'Generate only the project directory tree without bundling file contents')
		.option('-p, --print', 'Print the result (context.md content) in the Terminal')
		.option('-P, --printOnly', 'Print the result (context.md content) in the Terminal and delete it (context.md) after printing it')

	program.parse(process.argv);

	return program.opts();
}

export { readFlags };