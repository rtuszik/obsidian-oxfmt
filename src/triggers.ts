import { MarkdownView } from 'obsidian';
import type OxfmtPlugin from './main';

type Wrappable<T> = T & { __oxfmtWrapped?: boolean };
type PlainCallback = Wrappable<() => unknown>;
type CheckCallback = Wrappable<(checking: boolean) => unknown>;

interface InternalCommand {
    callback?: PlainCallback;
    checkCallback?: CheckCallback;
}

interface CommandsRegistry {
    commands: Record<string, InternalCommand | undefined>;
}

export function registerTriggers(plugin: OxfmtPlugin): void {
    installSaveHook(plugin);
    installBlurHook(plugin);
}

function installSaveHook(plugin: OxfmtPlugin): void {
    const commands = (plugin.app as unknown as { commands?: CommandsRegistry }).commands;
    const saveCommand = commands?.commands['editor:save-file'];
    if (!saveCommand) {
        console.warn('[oxfmt] editor:save-file command not found; format on save is unavailable.');
        return;
    }

    let formatting = false;
    const formatThenSave = (save: () => void): void => {
        if (plugin.settings.formatOnSave && !formatting) {
            formatting = true;
            void plugin.formatActiveFile({ silent: true }).finally(() => {
                formatting = false;
                save();
            });
        } else {
            save();
        }
    };

    if (typeof saveCommand.checkCallback === 'function') {
        if (saveCommand.checkCallback.__oxfmtWrapped) {
            return;
        }
        const original = saveCommand.checkCallback.bind(saveCommand);
        const wrapper: CheckCallback = (checking: boolean) => {
            if (checking) {
                return original(true);
            }
            formatThenSave(() => original(false));
            return undefined;
        };
        wrapper.__oxfmtWrapped = true;
        saveCommand.checkCallback = wrapper;
        plugin.register(() => {
            if (saveCommand.checkCallback === wrapper) {
                saveCommand.checkCallback = original;
            }
        });
        return;
    }

    if (typeof saveCommand.callback === 'function') {
        if (saveCommand.callback.__oxfmtWrapped) {
            return;
        }
        const original = saveCommand.callback.bind(saveCommand);
        const wrapper: PlainCallback = () => {
            formatThenSave(() => original());
        };
        wrapper.__oxfmtWrapped = true;
        saveCommand.callback = wrapper;
        plugin.register(() => {
            if (saveCommand.callback === wrapper) {
                saveCommand.callback = original;
            }
        });
        return;
    }

    console.warn(
        '[oxfmt] editor:save-file has no callback to wrap; format on save is unavailable.',
    );
}

function installBlurHook(plugin: OxfmtPlugin): void {
    let previous: { view: MarkdownView; path: string } | null = null;

    plugin.registerEvent(
        plugin.app.workspace.on('active-leaf-change', () => {
            const leaving = previous;
            const active = plugin.app.workspace.getActiveViewOfType(MarkdownView);
            const activeFile = active?.file ?? null;

            if (
                plugin.settings.formatOnBlur &&
                leaving &&
                leaving.view.file &&
                leaving.view.file.path === leaving.path &&
                leaving.path !== activeFile?.path &&
                isViewStillOpen(plugin, leaving.view)
            ) {
                void plugin.formatView(leaving.view, leaving.view.file, {
                    silent: true,
                });
            }

            previous = active && active.file ? { view: active, path: active.file.path } : null;
        }),
    );
}

function isViewStillOpen(plugin: OxfmtPlugin, view: MarkdownView): boolean {
    return plugin.app.workspace.getLeavesOfType('markdown').some((leaf) => leaf.view === view);
}
