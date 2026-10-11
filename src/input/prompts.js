import { input, confirm } from '@inquirer/prompts';

async function dirPathInput() {
	return await input({ message: "Your directory path :", default: "./" });
}

async function outputPathInput() {
	return await input({ message: "Your output path :", default: "./" });
}

async function addConfigFileInput() {
	return await confirm({ message: "Do you want to add a config file :", default: false });
}

export { dirPathInput, outputPathInput, addConfigFileInput };