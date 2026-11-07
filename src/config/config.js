import { configurationDefault } from '../shared/index.js';
import { validateConfig } from './validation.js';
import { writeConfig } from './io.js';
import { readConfig } from './io.js';

export async function config(dirPath, askAbout) {
	let configuration = await readConfig(dirPath);
	if (!configuration) {
		configuration = configurationDefault;
		if (await askAbout.addConfigFile()) {
			await writeConfig(dirPath, configurationDefault);
		}
	}
	configuration = await validateConfig(configuration, dirPath);
	return configuration;
}