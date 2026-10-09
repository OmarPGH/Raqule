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
	'*.tsbuildinfo',
	'*.log',
	'npm-debug.log*',
	'yarn-debug.log*',
	'yarn-error.log*',

	// Secrets / Credentials
	'.env!(.example|.sample)*',
	'.npmrc',
	'.pypirc',
	'.netrc',

	// Cloud / Infrastructure credentials
	'.aws',
	'.azure',
	'.gcloud',
	'.kube',
	'.terraform',
	'*.tfstate',
	'*.tfstate.*',

	// Rust
	'target',
	'Cargo.lock',

	// Python
	'__pycache__',
	'*.pyc',
	'.venv',
	'venv',
	'.pytest_cache',
	'.mypy_cache',
	'.ruff_cache',
	'.tox',
	'*.egg-info',

	// Java / Kotlin / JVM
	'.gradle',
	'.idea',
	'*.class',
	'*.jar',

	// Go
	'vendor',

	// .NET
	'bin',
	'obj',
	'*.user',

	// C / C++
	'CMakeFiles',
	'cmake-build-debug',
	'cmake-build-release',
	'*.o',
	'*.obj',

	// Dart / Flutter
	'.dart_tool',
	'.pub-cache',
	'*.g.dart',

	// Ruby
	'.bundle',

	// Swift / Xcode
	'DerivedData',
	'*.xcuserstate',

	// OS / Editor junk
	'.DS_Store',
	'Thumbs.db',
	'*.swp',
	'*.swo',
	'*~',
];

export { defaultIgnoreList };