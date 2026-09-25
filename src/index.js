import path from 'node:path';
import { askAboutDirPath, askAboutOutputPath } from './prompts.js';
import { gather } from './gather.js';
import { generateTree } from './tree.js';
import { formatTree, formatFiles, formatFinal } from './format.js';
import { write } from './write.js';
import { readFlags } from './flags.js';
import { readConfig, writeConfig } from './config.js';
import { countTokens } from './tokens.js';

async function main() {
	const flags = await readFlags();
	const dirPath = await askAboutDirPath();
	const configuration = await readConfig(dirPath);

	if (Object.keys(configuration).length < 1) {
		await writeConfig(dirPath);
	}

	let outputPath;

	if (flags.printOnly) {
		outputPath = './';
	} else {
		outputPath = await askAboutOutputPath();
	}

	const contextFile = path.resolve(outputPath, 'context.md');
	const treeStr = await generateTree(dirPath, flags, configuration);
	const formattedTree = formatTree(treeStr);

	let finalContent = formattedTree;

	if (!flags.tree) {
		const filesTree = await gather(dirPath, flags, configuration);
		const formattedFiles = formatFiles(filesTree);
		finalContent = formatFinal(formattedTree, formattedFiles);
	}

	if (!flags.printOnly) {
		await write(finalContent, contextFile);
		console.log(`You'll find context.md file at [ ${path.join(outputPath, 'context.md')} | ${contextFile} ]`);
	}

	if (flags.tokens) {
		const totalTokens = countTokens(finalContent);
		console.log(`\nEstimated Total Tokens: ${totalTokens.toLocaleString()}`)
	}

	if (flags.print || flags.printOnly) {
		console.log('\n\n The result:')
		console.log(`\n\n${finalContent}`);
	}
}

export { main };
