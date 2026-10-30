import { configurationDefault } from '../shared/index.js';
import { addConfigFileInput } from '../input/index.js';
import { validateConfig } from './validation.js';
import { writeConfig } from './io.js';
import { readConfig } from './io.js';

export async function config(dirPath) {
	let configuration = await readConfig(dirPath);
	if (!configuration) {
		configuration = configurationDefault;
		if (await addConfigFileInput()) {
			await writeConfig(dirPath, configurationDefault);
		}
	}
	configuration = await validateConfig(configuration, dirPath);
	return configuration;
}