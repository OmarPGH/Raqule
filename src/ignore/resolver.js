import mm from 'micromatch';
import { buildPatterns } from './patterns.js';

export class IgnoreResolver {
	constructor(flags, configuration, scope) {
	  	this.patterns = buildPatterns(flags, configuration, scope);
	  	this.matchers = this.patterns.map((pattern) => mm.matcher(pattern));
	}

	isIgnored(relativePath, fileName) {
	  	return (
	    	this.matchers.some((matches) => matches(relativePath)) ||
	    	this.matchers.some((matches) => matches(fileName))
	  	);
	}
}