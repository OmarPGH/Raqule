import { getEncoding } from 'js-tiktoken';

export function countTokens(text, encoding = 'o200k_base') {
	if (typeof text !== 'string') throw new Error('countTokens received non-string text, expected "string"');
	if (!text) return 0;
	const enc = getEncoding(encoding);
	return enc.encode(text).length;
}