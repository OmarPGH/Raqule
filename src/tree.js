import fs from 'node:fs';
import path from 'node:path';
import { IgnoreResolver } from './ignore/index.js';

async function generateTree(dirPath, flags, configuration, rootDirPath = dirPath) {
    async function generateTreeProcess(dirPath, indent = '', currentDepth = 1) {
        let treeStr = '';

        if (!indent) {
            const rootName = path.basename(path.resolve(dirPath));
            treeStr += `${rootName}\n`;
        }

        let items = await fs.promises.readdir(dirPath, { withFileTypes: true });
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemName = item.name;

            const isLast = i === items.length - 1;
            const pointer = isLast ? '└── ' : '├── ';

            const suffix = item.isDirectory() ? '/' : '';
            treeStr += `${indent}${pointer}${itemName}${suffix}\n`;

            if (item.isDirectory() && currentDepth < flags.depth) {
                const subPath = path.join(dirPath, itemName);
                const relativePath = path.relative(rootDirPath, subPath).split(path.sep).join('/');

                if (!ignored.isIgnored(relativePath, itemName)) {
                    const nextIndent = indent + (isLast ? '    ' : '│   ');
                    treeStr += await generateTreeProcess(subPath, nextIndent, currentDepth + 1);
                }
            }
        }
        return treeStr;
    }

    let ignored = new IgnoreResolver(flags, configuration, 'tree');
   
    return await generateTreeProcess(dirPath);
}

export { generateTree };