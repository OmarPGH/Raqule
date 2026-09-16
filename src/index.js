import path from 'node:path';
import { askAboutDirPath, askAboutOutputPath } from './prompts.js';
import { gather } from './gather.js';
import { generateTree } from './tree.js';
import { formatTree, formatFiles, formatFinal } from './format.js';
import { write } from './write.js';
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

	if (!flags.depth) {
		flags.depth = Infinity;
	} else {
		flags.depth = Number(flags.depth);
	}

	const treeStr = await generateTree(dirPath, flags);
	const formattedTree = formatTree(treeStr);

	let finalContent = formattedTree;

	if (!flags.tree) {
		const filesTree = await gather(dirPath, flags);
		const formattedFiles = formatFiles(filesTree);
		finalContent = formatFinal(formattedTree, formattedFiles);
	}

	if (!flags.printOnly) {
		await write(finalContent, contextFile);
		console.log(`You'll find context.md file at [ ${path.join(outputPath, 'context.md')} | ${contextFile} ]`);
	}

	if (flags.print || flags.printOnly) {
		console.log('\n\n The result:')
		console.log(`\n\n${finalContent}`);
	}
}

export { main };
