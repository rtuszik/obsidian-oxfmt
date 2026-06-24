import { spawn } from 'child_process';

export interface RunOxfmtOptions {
    binPath: string;
    content: string;
    filePath: string;
    cwd: string;
    configPath?: string;
}

export function runOxfmt(options: RunOxfmtOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        const args = [`--stdin-filepath=${options.filePath}`];
        if (options.configPath) {
            args.push(`--config=${options.configPath}`);
        }

        let child;
        try {
            child = spawn(options.binPath, args, { cwd: options.cwd }); // nosemgrep
        } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
            return;
        }

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });
        child.on('error', (error) => {
            reject(error);
        });
        child.on('close', (code) => {
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(stderr.trim() || `oxfmt exited with code ${code ?? 'null'}`));
            }
        });

        child.stdin.on('error', (error) => {
            if ((error as NodeJS.ErrnoException).code !== 'EPIPE') {
                reject(error);
            }
        });
        child.stdin.end(options.content);
    });
}
