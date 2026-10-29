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