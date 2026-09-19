const defaultIgnoreList = [
	// Version control
	'.git',
	'.svn',
	'.hg',

	// JavaScript / TypeScript / Node
	'node_modules',
	'package-lock.json',
	'yarn.lock',
	'pnpm-lock.yaml',
	'bun.lockb',
	'.npm',
	'dist',
	'build',
	'coverage',
	'.next',
	'.nuxt',
	'.output',
	'.turbo',
	'.cache',

	// Secrets / Credentials
	'.env',
	'.env.local',
	'.env.development',
	'.env.production',
	'.env.test',
	'.env.staging',
	'.npmrc',
	'.pypirc',
	'.netrc',

	// Cloud / Infrastructure credentials
	'.aws',
	'.azure',
	'.gcloud',
	'.kube',

	// Rust
	'target',
	'Cargo.lock',

	// Python
	'__pycache__',
	'.venv',
	'venv',
	'.pytest_cache',
	'.mypy_cache',
	'.ruff_cache',

	// Java / Kotlin / JVM
	'.gradle',
	'.idea',
	'out',

	// Go
	'vendor',

	// PHP
	'vendor',

	// .NET
	'bin',
	'obj',

	// C / C++
	'CMakeFiles',
	'cmake-build-debug',
	'cmake-build-release',

	// Dart / Flutter
	'.dart_tool',
	'.pub-cache',

	// Ruby
	'.bundle',

	// Swift / Xcode
	'DerivedData',

	// OS / Editor junk
	'.DS_Store',
	'Thumbs.db',
];
