import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IgnoreResolver } from '../src/ignore/resolver.js';

let ignored;

function ignores(items) {
  for (const item of items) {
    it(`Ignores ${item}`, () => {
      assert.ok(ignored.isIgnored(item, item));
      assert.ok(ignored.isIgnored(`folderOne/folderTwo/${item}`, item));
    });  
  }
}

describe('Default ignore system', () => {

  beforeEach(() => {
    ignored = new IgnoreResolver({}, { ignore: [] });
  });

  describe('Secrets / Credentials', () => {
    const items = ['.env', '.env.any', '.npmrc', '.pypirc', '.netrc'];
    ignores(items);

    it("Doesn't ignore .env.example/sample", () => {
      assert.ok(!ignored.isIgnored('secrets/envs/.env.example', '.env.example'));
      assert.ok(!ignored.isIgnored('.env.example', '.env.example'));      
      assert.ok(!ignored.isIgnored('secrets/envs/.env.sample', '.env.sample'));
      assert.ok(!ignored.isIgnored('.env.sample', '.env.sample'));
    });

  });

  describe('Version control', () => {
    const items = ['.git', '.svn', '.hg'];
    ignores(items);
  });  

  describe('JavaScript / TypeScript / Node', () => {
    const items = [
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
      'yarn-error.log*'
    ];
    ignores(items);
  });
  
  describe('Rust', () => {
    const items = [
      'target',
      'Cargo.lock'
    ];
    ignores(items);
  });  

  describe('Python', () => {
    const items = [
      '__pycache__',
      '*.pyc',
      '.venv',
      'venv',
      '.pytest_cache',
      '.mypy_cache',
      '.ruff_cache',
      '.tox',
      '*.egg-info'
    ];
    ignores(items);
  });

});