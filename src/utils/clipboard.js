import clipboard from 'clipboardy';

export async function clipboardWrite(text) {
	await clipboard.write(text);
	console.log('\nCopied to your clipboard');
}