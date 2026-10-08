import { defaultIgnoreList } from './defaultList.js';

export function buildPatterns(flags, configuration, scope) {
	function exclude(flags, configuration, scope) {
	   	let ignored = [];

	    if (configuration.ignore) {
			ignored = [...ignored, ...configuration.ignore];
	    }
	    if (!flags.all) {
	        ignored = [...ignored, ...defaultIgnoreList];
	    }
	    if (flags.exclude) {
	        ignored = [...ignored, ...flags.exclude];
	    }
	    if (flags[`${scope}Exclude`]) {
	        ignored = [...ignored, ...flags[`${scope}Exclude`]];
	    }

	    return ignored;
	}

	function include(ignored, flags, scope) {
	    if (flags.include) {
	        ignored = ignored.filter(ele => !flags.include.includes(ele));
	    }
	    if (flags[`${scope}Include`]) {
	        ignored = ignored.filter(ele => !flags[`${scope}Include`].includes(ele));
	    }

	    return ignored;
	}

	return include(exclude(flags, configuration, scope), flags, scope);
}