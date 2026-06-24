import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { expandHome, parseExtensions } from '../src/util.ts';

describe('parseExtensions', () => {
    it('splits on commas and whitespace', () => {
        assert.deepEqual(parseExtensions('md, ts, json'), ['md', 'ts', 'json']);
        assert.deepEqual(parseExtensions('md ts\njson'), ['md', 'ts', 'json']);
    });

    it('strips leading dots and lowercases', () => {
        assert.deepEqual(parseExtensions('.MD, .Ts'), ['md', 'ts']);
    });

    it('drops empty entries from stray separators', () => {
        assert.deepEqual(parseExtensions(' , md ,, ts , '), ['md', 'ts']);
    });

    it('returns an empty array for blank input', () => {
        assert.deepEqual(parseExtensions(''), []);
        assert.deepEqual(parseExtensions('   '), []);
    });
});

describe('expandHome', () => {
    it('expands a bare tilde to the home directory', () => {
        assert.equal(expandHome('~'), homedir());
    });

    it('expands a tilde-slash prefix', () => {
        assert.equal(expandHome('~/bin/oxfmt'), join(homedir(), 'bin/oxfmt'));
    });

    it('leaves absolute and bare paths untouched', () => {
        assert.equal(expandHome('/usr/local/bin/oxfmt'), '/usr/local/bin/oxfmt');
        assert.equal(expandHome('oxfmt'), 'oxfmt');
    });

    it('does not expand a tilde that is not a home prefix', () => {
        assert.equal(expandHome('~oxfmt'), '~oxfmt');
    });
});
