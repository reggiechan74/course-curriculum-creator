import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runCli } from './cli/args.js';
import { coreCommands } from './commands-core.js';

export { coreCommands };

const isMain = (() => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch { return false; }
})();

if (isMain) process.exitCode = await runCli(process.argv.slice(2), coreCommands);
