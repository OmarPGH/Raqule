import fs from 'node:fs';
import path from 'node:path';
import { clipboardWrite, countTokens, formatTree, formatFiles, formatFinal } from './utils/index.js';
import { readFlags, dirPathInput, outputPathInput } from './input/index.js';
import { gather, generateTree } from './core/index.js';
import { validateDirectory } from './validation/index.js';
import { outputFileName } from './shared/index.js';
import { config } from './config/index.js';

async function main() {
	const flags = await readFlags();
	const dirPath = await validateDirectory(await dirPathInput());
	const configuration = await config(dirPath);
	const treeStr = await generateTree(dirPath, flags, configuration);
	const formattedTree = formatTree(treeStr);
	let finalContent = formattedTree;
	
	const triggers = [
		{
			condition: () => !flags.tree,
			action: async () => {
				const filesTree = await gather(dirPath, flags, configuration);
				const formattedFiles = formatFiles(filesTree);
				finalContent = formatFinal(formattedTree, formattedFiles);
			}
		},
		{
			condition: () => flags.copy,
			action: async () => {
				await clipboardWrite(finalContent);
			}
		},
		{
			condition: () => flags.print || flags.printOnly,
			action: () => {
				console.log(finalContent);
				console.log('The Result is Above')
			}
		},
		{
			condition: () => flags.tokens,
			action: () => {
				const totalTokens = countTokens(finalContent);
				console.log(`\nEstimated Total Tokens: ${totalTokens.toLocaleString()}`);
			}
		},
		{
			condition: () => !flags.printOnly,
			action: async () => {
				const outputPath = await validateDirectory(await outputPathInput());
				const outputFile = path.resolve(outputPath, outputFileName);
				await fs.promises.writeFile(outputFile, finalContent);
				console.log(`\nYou'll find ${outputFileName} file at [ ${path.join(outputPath, outputFileName)} | ${outputFile} ]`);
			}
		},
	];
	
	for (const trigger of triggers) {
		if (trigger.condition()) await trigger.action();
	}
}

export { main };