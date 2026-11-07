import { input, confirm } from '@inquirer/prompts';

let flags;

async function ask(type, message, defaultVal) {
	if (flags.yes === true) return defaultVal;
	return await type({ message: message, default: defaultVal });
}

export function buildAskAbout(flagsInput) {
	flags = flagsInput;
	return {
		dirPath: () => ask(input, "Your directory path :", "./"),
		outputPath: () => ask(input, "Your output path :", "./"),
		addConfigFile: () => ask(confirm, "Do you want to add a config file :", false),
	};
}