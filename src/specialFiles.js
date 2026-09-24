const LICENSE_PREVIEW_LINES = 3;

const specialFileHandlers = {
	license: (content) => content.split('\n').slice(0, LICENSE_PREVIEW_LINES).join('\n'),
};

function getSpecialFileHandler(fileName) {
	const parts = fileName.split('.');
	const baseName = (parts[0] || parts[1] || '').toLowerCase();
	return specialFileHandlers[baseName];
}

export { getSpecialFileHandler };
