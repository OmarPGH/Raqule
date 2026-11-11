import { input, confirm } from '@inquirer/prompts';

export function buildAskAbout(flags, prompts = { input, confirm }) {
	const ask = async (prompt, message, defaultVal, presetValue) => {
		if (presetValue !== undefined) {
			console.log(`\n${message}\n"${presetValue}" has been selected as the preset value`);
			return presetValue;
		}

		if (flags.default || flags.nonInteractive) {
			console.log(`\n${message}\n"${defaultVal}" has been selected as the default`);
			return defaultVal;
		}

		return await prompt({ message, default: defaultVal });
	};

	return {
		dirPath: () => ask(prompts.input, "Your directory path :", "./", flags.directoryPath),
		outputPath: () => ask(prompts.input, "Your output path :", "./", flags.output),
		addConfigFile: () => ask(prompts.confirm, "Do you want to add a config file :", false, flags.createConfig),
	};
}
