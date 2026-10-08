import fs from 'node:fs';
import path from 'node:path';
import { isIgnored } from './helpers/ignore.js';
import { buildPatterns } from './ignore/patterns.js';

async function generateTree(dirPath, flags, configuration) {
    async function generateTreeProcess(dirPath, indent = '', rootDirPath = dirPath, currentDepth = 1) {
        let treeStr = '';

        if (!indent) {
            const rootName = path.basename(path.resolve(dirPath));
            treeStr += `${rootName}\n`;
        }

        let items = await fs.promises.readdir(dirPath, { withFileTypes: true });
        let ignored = buildPatterns(flags, configuration, 'tree');
        
        ignored = [...new Set(ignored)];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const isLast = i === items.length - 1;
            const pointer = isLast ? '└── ' : '├── ';

            const suffix = item.isDirectory() ? '/' : '';
            treeStr += `${indent}${pointer}${item.name}${suffix}\n`;

            if (item.isDirectory() && currentDepth < flags.depth) {
                const subPath = path.join(dirPath, item.name);
                const relativePath = path.relative(rootDirPath, subPath).split(path.sep).join('/');

                if (!isIgnored(relativePath, item.name, ignored)) {
                    const nextIndent = indent + (isLast ? '    ' : '│   ');
                    treeStr += await generateTreeProcess(subPath, nextIndent, rootDirPath, currentDepth + 1);
                }
            }
        }
        return treeStr;
    }

    return await generateTreeProcess(dirPath);
}

export { generateTree };