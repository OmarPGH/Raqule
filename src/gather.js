import fs from 'node:fs';
import path from 'node:path';
import { defaultIgnoreList } from './ignoreList.js';
import { getSpecialFileHandler } from './specialFiles.js';

async function gather(dirPath, flags, currentDepth = 1) {
	if (currentDepth > flags.depth) return {};

	let dirFiles = await fs.promises.readdir(dirPath);

	if (!flags.all) {
		dirFiles = dirFiles.filter(item => !defaultIgnoreList.includes(item));
	}

	const result = {};

	for (let i = 0; i < dirFiles.length; i++) {
		const fileName = dirFiles[i];
		const filePath = path.join(dirPath, fileName);

		if ((await fs.promises.stat(filePath)).isDirectory()) {
			result[fileName] = {
				isFolder: true,
				children: await gather(filePath, flags, currentDepth + 1),
			};
			continue;
		}

		let fileContent = await fs.promises.readFile(filePath, 'utf8');
		const extension = path.extname(fileName).slice(1);

		const specialHandler = getSpecialFileHandler(fileName);
		if (specialHandler) {
			fileContent = specialHandler(fileContent);
		}

		result[fileName] = {
			isFolder: false,
			path: filePath,
			content: fileContent,
			extension,
		};
	}

	return result;
}

export { gather };
