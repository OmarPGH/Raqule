const defaultIgnoreList = [
	// Version control
	'.git',

	// JS / TS / Node
	'node_modules',
	'package-lock.json',
	'dist',
	'build',

	// Rust
	'target',
	'Cargo.lock',

	// Python
	'__pycache__',
	'.venv',
	'venv',

	// Java / Kotlin / JVM
	'.gradle',
	'out',

	// Go
	'vendor',
];

export { defaultIgnoreList };
