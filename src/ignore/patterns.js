import mm from 'micromatch';
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

	function isIncludedMatch(pattern, includePattern) {
		return mm.isMatch(pattern, [includePattern]) || mm.isMatch(includePattern, [pattern]);
	}

	function include(ignored, flags, scope) {
		if (flags.include) {
			ignored = ignored.filter(
				pattern => !flags.include.some(
					includePattern => isIncludedMatch(pattern, includePattern)
				)
			);
		}

		if (flags[`${scope}Include`]) {
			ignored = ignored.filter(
				pattern => !flags[`${scope}Include`].some(
					includePattern => isIncludedMatch(pattern, includePattern)
				)
			);
		}

		return ignored;
	}

	return [...new Set(include(exclude(flags, configuration, scope), flags, scope))];
}