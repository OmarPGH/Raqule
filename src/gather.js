import fs from 'node:fs';
import path from 'node:path';
import { specialFileHandler } from './specialFiles.js';
import { IgnoreResolver } from './ignore/index.js';

const BINARY_EXTENSIONS = new Set([
	'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'svg',
	'pdf', 'zip', 'gz', 'tar', 'rar', '7z',
	'woff', 'woff2', 'ttf', 'eot',
	'mp3', 'mp4', 'mov', 'avi', 'wav',
	'exe', 'dll', 'so', 'bin', 'class', 'wasm',
]);

async function gather(dirPath, flags, configuration, rootDirPath = dirPath) {
	async function gatherProcess(dirPath, currentDepth = 1) {
		if (currentDepth > flags.depth) return {};
		
        let items = await fs.promises.readdir(dirPath, { withFileTypes: true });
		const result = {};

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const itemName = item.name;
			const itemPath = path.join(dirPath, itemName);
			const relativePath = path.relative(rootDirPath, itemPath).split(path.sep).join('/');

			if (ignored.isIgnored(relativePath, itemName)) continue;

			if (item.isDirectory()) {
				result[itemName] = {
					isFolder: true,
					children: await gatherProcess(itemPath, currentDepth + 1),
				};
				continue;
			}

			const extension = path.extname(itemName).slice(1);

			if (BINARY_EXTENSIONS.has(extension.toLowerCase())) {
				result[itemName] = {
					isFolder: false,
					path: itemPath,
					relativePath: relativePath,
					content: '[Binary file skipped]',
					extension,
				};
				continue;
			}

			let itemContent = await fs.promises.readFile(itemPath, 'utf8');

			const specialHandler = specialFileHandler(itemName);
			if (specialHandler) {
				itemContent = specialHandler(itemContent);
			}

			result[itemName] = {
				isFolder: false,
				path: itemPath,
				relativePath: relativePath,
				content: itemContent,
				extension,
			};
		}

		return result;
	}

	let ignored = new IgnoreResolver(flags, configuration, 'content');
	
	return await gatherProcess(dirPath);
}

export { gather };