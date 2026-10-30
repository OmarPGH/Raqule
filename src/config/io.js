import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'smol-toml';
import { configFileName } from '../shared/index.js'

export async function readConfig(dirPath) {
	const configPath = path.resolve(dirPath, configFileName);
	try {
		const configData = await fs.promises.readFile(configPath, 'utf8');
		try {
			const configParsed = parse(configData);
			return configParsed;
		} catch {
			return 'broken';
		}
	} catch {
		return undefined;
	}
}

export async function writeConfig(dirPath, content) {
	const configPath = path.resolve(dirPath, configFileName);
	await fs.promises.writeFile(configPath, stringify(content));
	return true;
}