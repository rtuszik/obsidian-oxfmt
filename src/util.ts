import { homedir } from 'os';
import { join } from 'path';

export function parseExtensions(raw: string): string[] {
    return raw
        .split(/[\s,]+/)
        .map((ext) => ext.trim().replace(/^\./, '').toLowerCase())
        .filter((ext) => ext.length > 0);
}

export function expandHome(input: string): string {
    if (input === '~') {
        return homedir();
    }
    if (input.startsWith('~/')) {
        return join(homedir(), input.slice(2));
    }
    return input;
}
