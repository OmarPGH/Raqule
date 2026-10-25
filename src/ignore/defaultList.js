import { outputFileName } from '../shared/index.js';

const defaultIgnoreList = {
	versionControl: ['.git', '.svn', '.hg'],

	javascript: [
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
	],

	secrets: ['.env!(.example|.sample)*', '.npmrc', '.pypirc', '.netrc'],

	cloud: [
		'.aws',
		'.azure',
		'.gcloud',
		'.kube',
		'.terraform',
		'*.tfstate',
		'*.tfstate.*',
	],

	rust: ['target', 'Cargo.lock'],

	python: [
		'__pycache__',
		'*.pyc',
		'.venv',
		'venv',
		'.pytest_cache',
		'.mypy_cache',
		'.ruff_cache',
		'.tox',
		'*.egg-info',
	],

	java: ['.gradle', '.idea', '*.class', '*.jar'],

	go: ['vendor'],

	dotnet: ['obj', '*.user'],

	cpp: [
		'CMakeFiles',
		'cmake-build-debug',
		'cmake-build-release',
		'*.o',
		'*.obj',
	],

	dart: ['.dart_tool', '.pub-cache', '*.g.dart'],

	ruby: ['.bundle'],

	swift: ['DerivedData', '*.xcuserstate'],

	osJunk: ['.DS_Store', 'Thumbs.db', '*.swp', '*.swo', '*~'],

	raqule: [outputFileName],
};

const flatDefaultIgnoreList = Object.values(defaultIgnoreList).flat();

export { defaultIgnoreList, flatDefaultIgnoreList };