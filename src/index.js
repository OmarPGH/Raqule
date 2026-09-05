import fs from 'node:fs';
import path from 'node:path';
import { askAboutDirPath, askAboutOutputPath } from './prompts.js';
import { gather } from './gather.js';
import { generateTree } from './tree.js';
import { readFlags } from './flags.js';

async function main() {
	const flags = await readFlags();
	const dirPath = await askAboutDirPath();
	let outputPath;
	
	if (flags.printOnly) {
		outputPath = './';
	} else {
		outputPath = await askAboutOutputPath();
	}

	const contextFile = path.resolve(outputPath, 'context.md');
	await fs.promises.writeFile(contextFile, '');

	if (!flags.depth > 0) {
		flags.depth = Infinity;
	}

	await generateTree(dirPath, contextFile, flags);

	if (flags.tree) {
		return;
	}

	await gather(dirPath, outputPath, contextFile, flags);	
	
	async function print() {
		if (flags.print) {
			console.log('\n\n The result:')
			console.log(`\n\n${await fs.promises.readFile(contextFile, 'utf8')}`);
		} 	
	}

	if (!flags.printOnly) {
		console.log(`You'll find context.md file at [ ${path.join(outputPath, 'context.md')} | ${contextFile} ]`)
		await print();
	} else {
		flags.print = true;
		await print();
		await fs.promises.unlink(contextFile);
	}
	
}

export { main };