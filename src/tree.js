import fs from 'node:fs';
import path from 'node:path';

async function generateTree(dirPath, contextFile, flags) {
    async function generateTreeProcess(dirPath, indent = '', currentDepth = 1) {
        let treeStr = '';

        if (!indent) {
            const rootName = path.basename(path.resolve(dirPath));
            treeStr += `${rootName}\n`;
        }

        let items = await fs.promises.readdir(dirPath, { withFileTypes: true });

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const absoluteItemPath = path.resolve(item.parentPath, item.name);

            if (absoluteItemPath === contextFile) continue;
            
            const isLast = i === items.length - 1;
    		const pointer = isLast ? '└── ' : '├── ';

            treeStr += `${indent}${pointer}${item.name}\n`;

            if (item.isDirectory() && currentDepth < flags.depth && (flags.all || !['node_modules', '.git'].includes(item.name))) {
                const nextIndent = indent + (isLast ? '    ' : '│   ');
                const subPath = path.join(dirPath, item.name);

                treeStr += await generateTreeProcess(subPath, nextIndent, currentDepth + 1);
            }
        }
        return treeStr;
    }
    await fs.promises.appendFile(contextFile, `Project Tree:\n\n\`\`\`\n${await generateTreeProcess(dirPath)}\n\`\`\`\n\n${'-'.repeat(5)}~END~${'-'.repeat(5)}\n\n`);
}

export { generateTree };