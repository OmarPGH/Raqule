import fs from 'node:fs';

async function write(content, filePath) {
	await fs.promises.writeFile(filePath, content);
}

export { write };
