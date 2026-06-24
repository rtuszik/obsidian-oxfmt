import {
    Editor,
    EditorPosition,
    FileSystemAdapter,
    MarkdownView,
    Notice,
    Plugin,
    TFile,
} from 'obsidian';
import { isAbsolute, join } from 'path';
import { runOxfmt } from './formatter';
import { DEFAULT_SETTINGS, OxfmtSettings, OxfmtSettingTab } from './settings';
import { registerTriggers } from './triggers';
import { expandHome, isExtensionEnabled, isSupportedExtension } from './util';

interface FormatOptions {
    silent?: boolean;
}

export default class OxfmtPlugin extends Plugin {
    settings!: OxfmtSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new OxfmtSettingTab(this.app, this));

        this.addRibbonIcon('paintbrush', 'Format with oxfmt', () => {
            void this.formatActiveFile();
        });

        this.addCommand({
            id: 'format-current-file',
            name: 'Format current file with oxfmt',
            editorCallback: (editor: Editor, ctx) => {
                const file = ctx.file;
                if (file) {
                    void this.formatEditor(editor, file);
                }
            },
        });

        registerTriggers(this);
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            (await this.loadData()) as Partial<OxfmtSettings>,
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async formatActiveFile(options: FormatOptions = {}): Promise<void> {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        const file = view?.file ?? null;
        if (!view || !file) {
            if (!options.silent) {
                new Notice('oxfmt: no active file to format.');
            }
            return;
        }
        await this.formatEditor(view.editor, file, options);
    }

    async formatView(view: MarkdownView, file: TFile, options: FormatOptions = {}): Promise<void> {
        await this.formatEditor(view.editor, file, options);
    }

    async formatEditor(editor: Editor, file: TFile, options: FormatOptions = {}): Promise<void> {
        const ext = file.extension.toLowerCase();
        if (!isSupportedExtension(ext)) {
            if (!options.silent) {
                new Notice(`oxfmt does not support .${file.extension} files.`);
            }
            return;
        }
        if (!isExtensionEnabled(ext, this.settings.disabledExtensions)) {
            if (!options.silent) {
                new Notice(`oxfmt: .${file.extension} formatting is disabled in settings.`);
            }
            return;
        }

        const basePath = this.getVaultBasePath();
        if (basePath === null) {
            if (!options.silent) {
                new Notice('oxfmt: requires a local vault (desktop only).');
            }
            return;
        }

        const original = editor.getValue();
        let formatted: string;
        try {
            formatted = await runOxfmt({
                binPath: this.resolveBinPath(),
                content: original,
                filePath: join(basePath, file.path),
                cwd: basePath,
                configPath: this.resolveConfigPath(basePath),
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('[oxfmt]', error);
            if (this.settings.notifyOnError) {
                new Notice(`oxfmt failed: ${message}`, 8000);
            }
            return;
        }

        if (formatted === original) {
            return;
        }

        this.applyFormatted(editor, formatted);
    }

    private applyFormatted(editor: Editor, formatted: string): void {
        const selections = editor.listSelections();
        const scroll = editor.getScrollInfo();

        editor.setValue(formatted);

        const lastLine = editor.lineCount() - 1;
        const clamp = (pos: EditorPosition): EditorPosition => {
            const line = Math.min(Math.max(pos.line, 0), lastLine);
            const ch = Math.min(Math.max(pos.ch, 0), editor.getLine(line).length);
            return { line, ch };
        };
        if (selections.length > 0) {
            editor.setSelections(
                selections.map((range) => ({
                    anchor: clamp(range.anchor),
                    head: clamp(range.head),
                })),
            );
        }
        editor.scrollTo(scroll.left, scroll.top);
    }

    private resolveBinPath(): string {
        const configured = this.settings.binPath.trim();
        if (!configured) {
            return 'oxfmt';
        }
        return expandHome(configured);
    }

    private resolveConfigPath(basePath: string): string | undefined {
        const configured = this.settings.configPath.trim();
        if (!configured) {
            return undefined;
        }
        const expanded = expandHome(configured);
        return isAbsolute(expanded) ? expanded : join(basePath, expanded);
    }

    private getVaultBasePath(): string | null {
        const adapter = this.app.vault.adapter;
        return adapter instanceof FileSystemAdapter ? adapter.getBasePath() : null;
    }
}
