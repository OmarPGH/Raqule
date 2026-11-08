import { input, confirm } from '@inquirer/prompts';

let flags;

async function ask(type, message, defaultVal) {
	if (flags.default === true || flags.nonInteractive === true || !process.stdin.isTTY) return defaultVal;
	return await type({ message: message, default: defaultVal });
}

export function buildAskAbout(flagsInput) {
	flags = flagsInput;
	return {
		dirPath: () => flags.directoryPath ?? ask(input, "Your directory path :", "./"),
		outputPath: () => flags.output ?? ask(input, "Your output path :", "./"),
		addConfigFile: () => flags.createConfig === true || ask(confirm, "Do you want to add a config file :", false),
	};
}