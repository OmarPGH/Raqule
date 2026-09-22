import fs from 'node:fs';
import path from 'node:path';
import { exclude, include } from './helpers/ignore.js';

async function generateTree(dirPath, flags, configuration) {
    async function generateTreeProcess(dirPath, indent = '', currentDepth = 1) {
        let treeStr = '';

        if (!indent) {
            const rootName = path.basename(path.resolve(dirPath));
            treeStr += `${rootName}\n`;
        }

        let items = await fs.promises.readdir(dirPath, { withFileTypes: true });
        let ignored = [];
        
        ignored = exclude(ignored, flags, configuration, 'tree');
        ignored = include(ignored, flags, 'tree');
        ignored = [...new Set(ignored)];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const isLast = i === items.length - 1;
    		const pointer = isLast ? '└── ' : '├── ';

            const suffix = item.isDirectory() ? '/' : '';
            treeStr += `${indent}${pointer}${item.name}${suffix}\n`;

            if (item.isDirectory() && currentDepth < flags.depth && !ignored.includes(item.name)) {
                const nextIndent = indent + (isLast ? '    ' : '│   ');
                const subPath = path.join(dirPath, item.name);

                treeStr += await generateTreeProcess(subPath, nextIndent, currentDepth + 1);
            }
        }
        return treeStr;
    }

    return await generateTreeProcess(dirPath);
}

export { generateTree };
