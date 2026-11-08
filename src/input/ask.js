import { input, confirm } from '@inquirer/prompts';

let flags;

async function ask(type, message, defaultVal) {
	if (flags.default === true || !process.stdin.isTTY) return defaultVal;
	return await type({ message: message, default: defaultVal });
}

export function buildAskAbout(flagsInput) {
	flags = flagsInput;
	return {
		dirPath: () => flags.directory ?? ask(input, "Your directory path :", "./"),
		outputPath: () => flags.output ?? ask(input, "Your output path :", "./"),
		addConfigFile: () => ask(confirm, "Do you want to add a config file :", false),
	};
}