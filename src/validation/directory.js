import fs from 'node:fs';

export async function validateDirectory(directory) {
	try {
        const stat = await fs.promises.stat(directory);
        if (!stat.isDirectory()) {
            throw new Error(`"${directory}"\n\nexists but isn't a directory.`);
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Directory not found:\n\n"${directory}".\n\nPlease check the path and try again.`);
        }
        throw err;
    }
    return directory;
}