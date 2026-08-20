import fs from 'node:fs';
import path from 'node:path';

async function gather(dirPath, outputPath, contextFile, flags, currentDepth = 1) {
 	if (currentDepth > flags.depth) return;

 	let dirFiles = await fs.promises.readdir(dirPath);
 	
 	if (!flags.all) {
		dirFiles = dirFiles.filter(item => !['node_modules', '.git', 'package-lock.json', 'LICENSE'].includes(item));
 	}

 	if (currentDepth === 1) {
		try {
			await fs.promises.access(contextFile);
		} catch {
			await fs.promises.writeFile(contextFile, '');
		}
 	}

	for (let i = 0; i < dirFiles.length; i++) {
		const fileName = dirFiles[i];
		const filePath = path.join(dirPath, fileName);
		const absoluteFilePath = path.resolve(filePath);

		if (absoluteFilePath === contextFile) continue;

		if ((await fs.promises.stat(filePath)).isDirectory()) {
			await gather(filePath, outputPath, contextFile, flags, currentDepth + 1);
			continue;
		}

		const fileContent = await fs.promises.readFile(filePath, 'utf8');
		const fileType = path.extname(fileName).slice(1);

		await fs.promises.appendFile(contextFile, `${filePath} Content :\n\n\`\`\`${fileType}\n${fileContent}\n\`\`\`\n\n${'-'.repeat(5)}~END~${'-'.repeat(5)}\n\n`);
	}
}

export { gather };