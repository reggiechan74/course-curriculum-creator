import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { type CommandTable, requireFlag, requirePositional, runCli } from './cli/args.js';
import { checkStale, hashFile, writeHashes } from './hash.js';

export const coreCommands: CommandTable = {
  hash: (a) => ({ hash: hashFile(requirePositional(a, 0, 'file')) }),
  stale: (a) => checkStale(requirePositional(a, 0, 'output'), requireFlag(a, 'course')),
  'hash-write': (a) => {
    writeHashes(requirePositional(a, 0, 'output'), requireFlag(a, 'course'));
    return { ok: true };
  },
};

const isMain = (() => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch { return false; }
})();

if (isMain) process.exitCode = await runCli(process.argv.slice(2), coreCommands);
