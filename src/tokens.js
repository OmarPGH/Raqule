import { encodingForModel } from 'js-tiktoken';

export function countTokens(text, modelName = 'gpt-5') {
	if (!text) return 0;
	try {
		const enc = encodingForModel(modelName);
		return enc.encode(text).length;
	} catch (error) {
		return Math.ceil(text.length / 4);
	}
}