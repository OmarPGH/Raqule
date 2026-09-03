import fs from 'node:fs';
import path from 'node:path';

const packageInfo = JSON.parse(await fs.promises.readFile(path.join(import.meta.dirname, '../package.json')));

export { packageInfo };