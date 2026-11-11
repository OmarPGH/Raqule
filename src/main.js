import fs from 'node:fs';
import path from 'node:path';
import { clipboardWrite, countTokens, formatTree, formatFiles, formatFinal } from './utils/index.js';
import { readFlags, buildAskAbout } from './input/index.js';
import { gather, generateTree } from './core/index.js';
import { validateDirectory } from './validation/index.js';
import { outputFileName } from './shared/index.js';
import { config } from './config/index.js';

async function main() {
	const flags = readFlags();
	const save = !flags.skipSave;
	if (save && flags.output) await validateDirectory(flags.output);
	const askAbout = buildAskAbout(flags);
	const dirPath = await validateDirectory(path.resolve(await askAbout.dirPath()));
	const configuration = await config(dirPath, askAbout);
	const treeStr = await generateTree(dirPath, flags, configuration);
	const formattedTree = formatTree(treeStr);
	let finalContent = formattedTree;
	let totalTokens;

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
			condition: () => flags.tokens || flags.max,
			action: () => {
				totalTokens = countTokens(finalContent);
			}
		},
		{
			condition: () => flags.max,
			action: () => {
				if (totalTokens > flags.max) {
					throw new Error(`The number of tokens exceeds the specified maximum limit (${flags.max})`);
				} else {
					flags.tokens = true;
				}
			}
		},
		{
			condition: () => flags.copy,
			action: async () => {
				await clipboardWrite(finalContent);
			}
		},
		{
			condition: () => flags.print,
			action: () => {
				console.log(finalContent);
				console.log('The Result is Above')
			}
		},
		{
			condition: () => flags.tokens,
			action: () => {
				if (flags.max) console.log(`\nBelow the maximum allowed number of tokens (${flags.max})`);
				console.log(`\nEstimated Total Tokens: ${totalTokens.toLocaleString()}`);
			}
		},
		{
			condition: () => save,
			action: async () => {
				const outputPath = await validateDirectory(await askAbout.outputPath());
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