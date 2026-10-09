import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'smol-toml';
import * as z from 'zod';
import { formatConfigErrors } from './format.js';

export async function readConfig(dirPath) {
	const configPath = path.resolve(dirPath, 'raqule-config.toml');
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
	const configPath = path.resolve(dirPath, 'raqule-config.toml');
	await fs.promises.writeFile(configPath, stringify(content));
	return true;
}

export function validateConfig(configuration) {
	const configSchema = z.object({
		ignore: z.array(z.string()),
	})
	const result = configSchema.safeParse(configuration);

	if (!result.success) {
		throw new Error(formatConfigErrors(result.error));
	}
}