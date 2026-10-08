import mm from 'micromatch';

export function isIgnored(relativePath, fileName, ignored) {
    return mm.isMatch(relativePath, ignored) || mm.isMatch(fileName, ignored);
}