function formatTree(treeStr) {
	return `Project Tree:\n\n\`\`\`\n${treeStr}\n\`\`\`\n\n${'-'.repeat(5)}~END~${'-'.repeat(5)}\n\n`;
}

function formatFiles(filesObj) {
	function formatEntries(entries, formattedFiles = []) {
		for (const name of Object.keys(entries)) {
			const entry = entries[name];

			if (entry.isFolder) {
				formatEntries(entry.children, formattedFiles);
				continue;
			}

			formattedFiles.push(`${entry.path} Content :\n\n\`\`\`${entry.extension}\n${entry.content}\n\`\`\`\n\n${'-'.repeat(5)}~END~${'-'.repeat(5)}\n\n`);
		}

		return formattedFiles;
	}

	return formatEntries(filesObj).join('');
}

function formatFinal(formattedTree, formattedFiles) {
	return formattedTree + formattedFiles;
}

export { formatTree, formatFiles, formatFinal };
