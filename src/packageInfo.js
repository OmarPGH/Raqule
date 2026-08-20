import fs from 'node:fs';

const packageInfo = JSON.parse(await fs.promises.readFile('../package.json'));

export { packageInfo };