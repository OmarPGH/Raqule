import * as z from 'zod';
import { formatConfigErrors } from './formatConfigErrors.js';

export async function validateConfig(configuration, dirPath) {
	if (configuration === 'broken') {
		throw new Error("Syntax Error: You have a broken config file.\
		\n Your config file doesn't comply with TOML files standards.\
		\n Please check it and rewrite it using the correct TOML standards.\
		\n You can also delete it if it doesn't contain anythig important, and create a new one.\
		\nAnd try again.");
	}

	const configSchema = z.object({
		ignore: z.array(z.string()),
	})
	const result = configSchema.safeParse(configuration);

	if (!result.success) {
		throw new Error(formatConfigErrors(result.error));
	}

	return configuration;
}