import path from 'node:path';
import { dirPathInput, outputPathInput, addConfigFileInput } from './prompts.js';
import { gather } from './gather.js';
import { generateTree } from './tree.js';
import { formatTree, formatFiles, formatFinal } from './format.js';
import { write } from './write.js';
import { readFlags } from './flags.js';
import { readConfig, writeConfig, validateConfig } from './config.js';
import { countTokens } from './tokens.js';

async function main() {
	const flags = await readFlags();
	const dirPath = path.resolve(await dirPathInput());
	let configuration = await readConfig(dirPath);
	const configurationDefault = { ignore: [] };

	if (!configuration) {
		configuration = configurationDefault;
		if (await addConfigFileInput()) {
			await writeConfig(dirPath, configurationDefault);
		}
	}
	if (configuration === 'broken') {
		throw new Error("Syntax Error: You have a broken config file.\
		\n Your config file doesn't comply with TOML files standards.\
		\n Please check it and rewrite it using the correct TOML standards.\
		\n You can also delete it if it doesn't contain anythig important, and create a new one.\
		\nAnd try again.");
	}

	validateConfig(configuration);
	let outputPath;

	if (flags.printOnly) {
		outputPath = './';
	} else {
		outputPath = await outputPathInput();
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
