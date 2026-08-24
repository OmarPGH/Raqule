import fs from 'node:fs';
import path from 'node:path';
import { askAboutDirPath, askAboutOutputPath } from './prompts.js';
import { gather } from './gather.js';
import { generateTree } from './tree.js';
import { readFlags } from './flags.js';

async function main() {
	const flags = await readFlags();
	const dirPath = await askAboutDirPath();
	const outputPath = await askAboutOutputPath();
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
	
	console.log(`You'll find context.md file at [ ${outputPath} ]`)
}

export { main };