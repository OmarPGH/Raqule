import fs from 'node:fs';
import path from 'node:path';

async function generateTree(dirPath, flags, indent = '', currentDepth = 1) {
    let treeStr = '';

    if (!indent) {
        const rootName = path.basename(path.resolve(dirPath));
        treeStr += `${rootName}\n`;
    }

    let items = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isLast = i === items.length - 1;
		const pointer = isLast ? '└── ' : '├── ';

        treeStr += `${indent}${pointer}${item.name}\n`;

        if (item.isDirectory() && currentDepth < flags.depth && (flags.all || !['node_modules', '.git'].includes(item.name))) {
            const nextIndent = indent + (isLast ? '    ' : '│   ');
            const subPath = path.join(dirPath, item.name);

            treeStr += await generateTree(subPath, flags, nextIndent, currentDepth + 1);
        }
    }

    return treeStr;
}

export { generateTree };