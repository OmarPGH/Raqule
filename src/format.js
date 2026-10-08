export function formatTree(treeStr) {
	return `Project Tree:\n\n\`\`\`\n${treeStr}\n\`\`\`\n\n${'-'.repeat(5)}~END~${'-'.repeat(5)}\n\n`;
}

export function formatFiles(filesObj) {
	function formatEntries(entries, formattedFiles = []) {
		for (const name of Object.keys(entries)) {
			const entry = entries[name];

			if (entry.isFolder) {
				formatEntries(entry.children, formattedFiles);
				continue;
			}

			formattedFiles.push(`${entry.relativePath} Content :\n\n\`\`\`${entry.extension}\n${entry.content}\n\`\`\`\n\n${'-'.repeat(5)}~END~${'-'.repeat(5)}\n\n`);
		}

		return formattedFiles;
	}

	return formatEntries(filesObj).join('');
}

export function formatFinal(formattedTree, formattedFiles) {
	return formattedTree + formattedFiles;
}

export function formatConfigErrors(error) {
	const lines = ['Config error at:'];
	const itemIndent = '  ';
	const detailIndent = '     ';

	error.issues.forEach((issue, index) => {
		const path = issue.path.join('.');
		const issueMessageSplited = issue.message.split(' ');
		const receivedValue = issueMessageSplited[issueMessageSplited.indexOf('received') + 1];
		
		lines.push(
			`\n${itemIndent}${index + 1}. [${path}]`, `${detailIndent}Found: ${receivedValue}\n${detailIndent}Expected: ${issue.expected}`);
	});

	return lines.join('\n');
}