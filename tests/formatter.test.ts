import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { runOxfmt } from '../src/formatter.ts';

const isWindows = process.platform === 'win32';

describe('runOxfmt', { skip: isWindows ? 'requires a POSIX shell' : false }, () => {
    let dir: string;
    let passthrough: string;
    let failing: string;
    let uppercase: string;

    before(() => {
        dir = mkdtempSync(join(tmpdir(), 'oxfmt-test-'));

        passthrough = join(dir, 'passthrough.sh');
        writeFileSync(passthrough, '#!/bin/sh\ncat\n');
        chmodSync(passthrough, 0o755);

        failing = join(dir, 'failing.sh');
        writeFileSync(failing, '#!/bin/sh\necho "boom: bad config" 1>&2\nexit 3\n');
        chmodSync(failing, 0o755);

        uppercase = join(dir, 'uppercase.sh');
        writeFileSync(uppercase, '#!/bin/sh\ntr "a-z" "A-Z"\n');
        chmodSync(uppercase, 0o755);
    });

    after(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    it('resolves with the binary stdout, passing content through stdin', async () => {
        const content = 'const x = 1\n';
        const result = await runOxfmt({
            binPath: passthrough,
            content,
            filePath: '/vault/note.md',
            cwd: dir,
        });
        assert.equal(result, content);
    });

    it('returns the formatted stdout, not the input', async () => {
        const result = await runOxfmt({
            binPath: uppercase,
            content: 'hello',
            filePath: '/vault/note.md',
            cwd: dir,
        });
        assert.equal(result, 'HELLO');
    });

    it('rejects with stderr text when the binary exits non-zero', async () => {
        await assert.rejects(
            runOxfmt({
                binPath: failing,
                content: 'x',
                filePath: '/vault/note.md',
                cwd: dir,
            }),
            /boom: bad config/,
        );
    });

    it('rejects when the binary cannot be found (ENOENT)', async () => {
        await assert.rejects(
            runOxfmt({
                binPath: join(dir, 'does-not-exist'),
                content: 'x',
                filePath: '/vault/note.md',
                cwd: dir,
            }),
        );
    });
});
