const LICENSE_PREVIEW_LINES = 3;

export function specialFileHandler(fileName) {
	const parts = fileName.split('.');
	const baseName = parts[0] || '';
	const extension = parts[1] || '';

	if (baseName.toLowerCase() === 'license' && ['', 'md', 'txt'].includes(extension)) {
		return (content) => content.split('\n').slice(0, LICENSE_PREVIEW_LINES).join('\n');
	}
}