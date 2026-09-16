const LICENSE_PREVIEW_LINES = 3;

const specialFileHandlers = {
	license: (content) => content.split('\n').slice(0, LICENSE_PREVIEW_LINES).join('\n'),
};

function getSpecialFileHandler(fileName) {
	const baseName = fileName.split('.')[0].toLowerCase();
	return specialFileHandlers[baseName];
}

export { getSpecialFileHandler };
