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

	if (!flags.depth > 0) {
		flags.depth = Infinity;
	}

	const contextFile = path.resolve(outputPath, 'context.md');

	await fs.promises.writeFile(contextFile, '');
	await fs.promises.appendFile(contextFile, `Project Tree:\n\n\`\`\`\n${await generateTree(dirPath, flags)}\n\`\`\`\n\n${'-'.repeat(5)}~END~${'-'.repeat(5)}\n\n`);
	await gather(dirPath, outputPath, contextFile, flags);	
	
	console.log(`You'll find context.md file at [ ${outputPath} ]`)
}

export { main };