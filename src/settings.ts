import { App, PluginSettingTab, Setting } from 'obsidian';
import type OxfmtPlugin from './main';
import { parseExtensions } from './util';

export interface OxfmtSettings {
    binPath: string;
    configPath: string;
    formatOnSave: boolean;
    formatOnBlur: boolean;
    extensions: string[];
    notifyOnError: boolean;
}

export const DEFAULT_SETTINGS: OxfmtSettings = {
    binPath: '',
    configPath: '',
    formatOnSave: true,
    formatOnBlur: false,
    extensions: ['md'],
    notifyOnError: true,
};

export class OxfmtSettingTab extends PluginSettingTab {
    plugin: OxfmtPlugin;

    constructor(app: App, plugin: OxfmtPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Format on save')
            .setDesc('Run oxfmt on the active file each time Obsidian saves it.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.formatOnSave).onChange(async (value) => {
                    this.plugin.settings.formatOnSave = value;
                    await this.plugin.saveSettings();
                }),
            );

        new Setting(containerEl)
            .setName('Format on blur')
            .setDesc('Run oxfmt on a note when you switch away from it.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.formatOnBlur).onChange(async (value) => {
                    this.plugin.settings.formatOnBlur = value;
                    await this.plugin.saveSettings();
                }),
            );

        new Setting(containerEl)
            .setName('File extensions')
            .setDesc(
                'Comma-separated extensions oxfmt is allowed to format (e.g. md, ts, json, css, yaml). Only files with these extensions are formatted.',
            )
            .addText((text) =>
                text
                    .setPlaceholder('md, ts, json, css')
                    .setValue(this.plugin.settings.extensions.join(', '))
                    .onChange(async (value) => {
                        this.plugin.settings.extensions = parseExtensions(value);
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName('oxfmt binary path')
            .setDesc(
                'Absolute path to the oxfmt binary. Leave empty to resolve "oxfmt" from PATH. On macOS the GUI app often has a minimal PATH, so an absolute path (e.g. ~/.local/share/mise/shims/oxfmt) is recommended.',
            )
            .addText((text) =>
                text
                    .setPlaceholder('oxfmt')
                    .setValue(this.plugin.settings.binPath)
                    .onChange(async (value) => {
                        this.plugin.settings.binPath = value.trim();
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName('Config path')
            .setDesc(
                'Optional path to an .oxfmtrc file. Leave empty to let oxfmt auto-discover one from the vault.',
            )
            .addText((text) =>
                text
                    .setPlaceholder('.oxfmtrc.json')
                    .setValue(this.plugin.settings.configPath)
                    .onChange(async (value) => {
                        this.plugin.settings.configPath = value.trim();
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName('Notify on error')
            .setDesc('Show a notice when oxfmt fails instead of failing silently.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.notifyOnError).onChange(async (value) => {
                    this.plugin.settings.notifyOnError = value;
                    await this.plugin.saveSettings();
                }),
            );
    }
}
