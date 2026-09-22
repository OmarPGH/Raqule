import fs from 'node:fs';
import path from 'node:path';
import { defaultIgnoreList } from './ignoreList.js';
import { getSpecialFileHandler } from './specialFiles.js';
import { exclude, include } from './helpers/ignore.js';

async function gather(dirPath, flags, configuration, currentDepth = 1) {
	if (currentDepth > flags.depth) return {};
	
	let dirFiles = await fs.promises.readdir(dirPath);
    let ignored = [];

    ignored = exclude(ignored, flags, configuration, 'content');
    ignored = include(ignored, flags, 'content');
	ignored = [...new Set(ignored)];

	const result = {};
	for (let i = 0; i < dirFiles.length; i++) {
		const fileName = dirFiles[i];
		if (ignored.includes(fileName)) continue;
		const filePath = path.join(dirPath, fileName);

		if ((await fs.promises.stat(filePath)).isDirectory()) {
			result[fileName] = {
				isFolder: true,
				children: await gather(filePath, flags, configuration, currentDepth + 1),
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
