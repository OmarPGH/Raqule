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
	const dirPath = await dirPathInput();
	validateDirectory(dirPath);
	
	const configuration = await config(dirPath);
	let outputPath;

	if (flags.printOnly) {
		outputPath = './';
	} else {
		outputPath = await outputPathInput();
		validateDirectory(outputPath);
	}

	const outputFile = path.resolve(outputPath, outputFileName);
	const treeStr = await generateTree(dirPath, flags, configuration);
	const formattedTree = formatTree(treeStr);

	let finalContent = formattedTree;

	if (!flags.tree) {
		const filesTree = await gather(dirPath, flags, configuration);
		const formattedFiles = formatFiles(filesTree);
		finalContent = formatFinal(formattedTree, formattedFiles);
	}

	if (flags.copy) {
		await clipboardWrite(finalContent);
	}

    if (flags.print || flags.printOnly) {
		console.log(finalContent);
		console.log('The Result is Above')
	}

    if (flags.tokens) {
		const totalTokens = countTokens(finalContent);
		console.log(`\nEstimated Total Tokens: ${totalTokens.toLocaleString()}`)
    }

	if (!flags.printOnly) {
		await fs.promises.writeFile(outputFile, finalContent);
		console.log(`\nYou'll find ${outputFileName} file at [ ${path.join(outputPath, outputFileName)} | ${outputFile} ]`);
	}
}

export { main };