import { homedir } from 'os';
import { join } from 'path';

export interface FileType {
    language: string;
    extensions: string[];
}

export const SUPPORTED_FILETYPES: FileType[] = [
    { language: 'Markdown', extensions: ['md', 'markdown'] },
    { language: 'JavaScript', extensions: ['js', 'mjs', 'cjs', 'jsx'] },
    { language: 'TypeScript', extensions: ['ts', 'mts', 'cts', 'tsx'] },
    { language: 'JSON', extensions: ['json', 'jsonc', 'json5'] },
    { language: 'YAML', extensions: ['yaml', 'yml'] },
    { language: 'CSS', extensions: ['css'] },
    { language: 'SCSS', extensions: ['scss'] },
    { language: 'LESS', extensions: ['less'] },
    { language: 'HTML', extensions: ['html', 'htm'] },
    { language: 'GraphQL', extensions: ['graphql', 'gql'] },
    { language: 'TOML', extensions: ['toml'] },
    { language: 'Vue', extensions: ['vue'] },
    { language: 'Svelte', extensions: ['svelte'] },
];

export const SUPPORTED_EXTENSIONS: string[] = SUPPORTED_FILETYPES.flatMap(
    (type) => type.extensions,
);

export function isSupportedExtension(ext: string): boolean {
    return SUPPORTED_EXTENSIONS.includes(ext.toLowerCase());
}

export function isExtensionEnabled(ext: string, disabled: string[]): boolean {
    const normalized = ext.toLowerCase();
    return isSupportedExtension(normalized) && !disabled.includes(normalized);
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
