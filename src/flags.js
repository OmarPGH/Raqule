import { program } from 'commander';
import { packageInfo } from './packageInfo.js';

async function readFlags() {
	program
		.name('Raqule')
		.description(packageInfo.description)
		.version(packageInfo.version)
		.option('-a, --all', 'Collect all files & directory include like [.git, node_modules]')
		.option('-d, --depth <number>', 'Select max depth')
		.option('-t, --tree', 'Generate and save only the project directory tree without bundling file contents')

	program.parse(process.argv);

	return program.opts();
}

export { readFlags };