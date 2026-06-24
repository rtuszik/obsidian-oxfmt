import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
    expandHome,
    isExtensionEnabled,
    isSupportedExtension,
    SUPPORTED_EXTENSIONS,
} from '../src/util.ts';

describe('isSupportedExtension', () => {
    it('recognizes supported extensions case-insensitively', () => {
        assert.equal(isSupportedExtension('md'), true);
        assert.equal(isSupportedExtension('TS'), true);
        assert.equal(isSupportedExtension('json'), true);
    });

    it('rejects extensions oxfmt does not handle', () => {
        assert.equal(isSupportedExtension('sql'), false);
        assert.equal(isSupportedExtension('astro'), false);
        assert.equal(isSupportedExtension('txt'), false);
    });
});

describe('isExtensionEnabled', () => {
    it('treats all supported extensions as enabled by default', () => {
        for (const ext of SUPPORTED_EXTENSIONS) {
            assert.equal(isExtensionEnabled(ext, []), true);
        }
    });

    it('reports a supported extension as disabled when listed', () => {
        assert.equal(isExtensionEnabled('md', ['md']), false);
        assert.equal(isExtensionEnabled('MD', ['md']), false);
    });

    it('leaves other extensions enabled when one is disabled', () => {
        assert.equal(isExtensionEnabled('ts', ['md']), true);
    });

    it('is always false for unsupported extensions', () => {
        assert.equal(isExtensionEnabled('sql', []), false);
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
