import { input, select } from '@inquirer/prompts';

async function askAboutDirPath() {
	return await input({ message: "Your directory path :", default: "./" });
}

async function askAboutOutputPath() {
	return await input({ message: "Your output path :", default: "./" });
}

export { askAboutDirPath, askAboutOutputPath };