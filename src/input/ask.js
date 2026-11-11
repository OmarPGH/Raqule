import { input, confirm } from '@inquirer/prompts';

async function ask(flags, prompt, message, defaultVal, presetValue) {
	if (presetValue !== undefined) {
		console.log(`\n${message}\n"${presetValue}" has been selected as the preset value`);
		return presetValue;
	}
	if (flags.default || flags.nonInteractive) {
		console.log(`\n${message}\n"${defaultVal}" has been selected as the default`);
		return defaultVal;
	}
	return await prompt({ message: message, default: defaultVal });
}

export function buildAskAbout(flags, prompts = { input, confirm }) {
	return {
		dirPath: () => ask(flags, prompts.input, "Your directory path :", "./", flags.directoryPath),
		outputPath: () => ask(flags, prompts.input, "Your output path :", "./", flags.output),
		addConfigFile: () => ask(flags, prompts.confirm, "Do you want to add a config file :", false, flags.createConfig),
	};
}
