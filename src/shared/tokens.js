import { getEncoding } from 'js-tiktoken';

export function countTokens(text, encoding = 'o200k_base') {
	if (!text) return 0;
	const enc = getEncoding(encoding);
	return enc.encode(text).length;
}