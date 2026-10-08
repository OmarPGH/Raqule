import fs from 'node:fs';
import path from 'node:path';
import { getSpecialFileHandler } from './specialFiles.js';
import { IgnoreResolver } from './ignore/resolver.js';

const BINARY_EXTENSIONS = new Set([
	'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'svg',
	'pdf', 'zip', 'gz', 'tar', 'rar', '7z',
	'woff', 'woff2', 'ttf', 'eot',
	'mp3', 'mp4', 'mov', 'avi', 'wav',
	'exe', 'dll', 'so', 'bin', 'class', 'wasm',
]);

async function gather(dirPath, flags, configuration, rootDirPath = dirPath, currentDepth = 1) {
	if (currentDepth > flags.depth) return {};
	
	let dirFiles = await fs.promises.readdir(dirPath);
    let ignored = new IgnoreResolver(flags, configuration, 'content');

	const result = {};
	for (let i = 0; i < dirFiles.length; i++) {
		const fileName = dirFiles[i];
		const filePath = path.join(dirPath, fileName);
		const relativePath = path.relative(rootDirPath, filePath).split(path.sep).join('/');

		if (ignored.isIgnored(relativePath, fileName)) continue;

		if ((await fs.promises.stat(filePath)).isDirectory()) {
			result[fileName] = {
				isFolder: true,
				children: await gather(filePath, flags, configuration, rootDirPath, currentDepth + 1),
			};
			continue;
		}

		const extension = path.extname(fileName).slice(1);

		if (BINARY_EXTENSIONS.has(extension.toLowerCase())) {
			result[fileName] = {
				isFolder: false,
				path: filePath,
				relativePath: relativePath,
				content: '[Binary file skipped]',
				extension,
			};
			continue;
		}

		let fileContent = await fs.promises.readFile(filePath, 'utf8');

		const specialHandler = getSpecialFileHandler(fileName);
		if (specialHandler) {
			fileContent = specialHandler(fileContent);
		}

		result[fileName] = {
			isFolder: false,
			path: filePath,
			relativePath: relativePath,
			content: fileContent,
			extension,
		};
	}

	return result;
}

export { gather };
