import { parse, stringify } from 'smol-toml'
import fs from 'node:fs';
import path from 'node:path';

export async function readConfig(dirPath) {
	const configPath = path.resolve(dirPath, 'raqule-config.toml');
	try {
		const configData = await fs.promises.readFile(configPath, 'utf8');
		const configParsed = parse(configData);
		return configParsed;
	} catch {
		return {};
	}
}

export async function writeConfig(dirPath) {
	const configPath = path.resolve(dirPath, 'raqule-config.toml');
	await fs.promises.writeFile(configPath, stringify({ ignore: [] }));
	return true;
}