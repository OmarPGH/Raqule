import { input, confirm } from '@inquirer/prompts';

let flags;

async function ask(type, message, defaultVal, flagValue) {
	if (flagValue !== undefined) return flagValue;
	if (flags.default || flags.nonInteractive) {
		console.log(`\n${message}\n"${defaultVal}" has been selected as the default`);
		return defaultVal;
	}
	return await type({ message: message, default: defaultVal });
}

export function buildAskAbout(flagsInput) {
	flags = flagsInput;
	return {
		dirPath: () => ask(input, "Your directory path :", "./", flags.directoryPath),
		outputPath: () => ask(input, "Your output path :", "./", flags.output),
		addConfigFile: () => ask(confirm, "Do you want to add a config file :", false, flags.createConfig),
	};
}