import mm from 'micromatch';
import { buildPatterns } from './patterns.js';

export class IgnoreResolver {
  constructor(flags, configuration, scope) {
    this.patterns = buildPatterns(flags, configuration, scope);
  }
  isIgnored(relativePath, fileName) {
    return mm.isMatch(relativePath, this.patterns) || mm.isMatch(fileName, this.patterns);
  }
}