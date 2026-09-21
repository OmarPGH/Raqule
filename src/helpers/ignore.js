import { defaultIgnoreList } from '../ignoreList.js';
export function exclude(ignored, flags, type) {
    if (!flags.all) {
        ignored = [...ignored, ...defaultIgnoreList];
    }
    if (flags.exclude) {
        ignored = [...ignored, ...flags.exclude];
    }
    if (flags[`${type}Exclude`]) {
        ignored = [...ignored, ...flags[`${type}Exclude`]];
    }

    return ignored;
}

export function include(ignored, flags, type) {
    if (flags.include) {
        ignored = ignored.filter(ele => !flags.include.includes(ele));
    }
    if (flags[`${type}Include`]) {
        ignored = ignored.filter(ele => !flags[`${type}Include`].includes(ele));
    }

    return ignored;
}