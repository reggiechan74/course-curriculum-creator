import { mkdirSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { type CommandTable, requireFlag, requirePositional, runCli } from './cli/args.js';
import { UsageError, ValidationError } from './errors.js';
import { checkStale, hashFile, writeHashes } from './hash.js';
import { type InitOptions, initManifest, loadManifest, saveManifest, validateManifest } from './manifest/io.js';

export const coreCommands: CommandTable = {
  hash: (a) => ({ hash: hashFile(requirePositional(a, 0, 'file')) }),
  stale: (a) => checkStale(requirePositional(a, 0, 'output'), requireFlag(a, 'course')),
  'hash-write': (a) => {
    writeHashes(requirePositional(a, 0, 'output'), requireFlag(a, 'course'));
    return { ok: true };
  },
  'manifest init': (a) => {
    const course = requireFlag(a, 'course');
    let opts: InitOptions;
    try { opts = JSON.parse(requireFlag(a, 'json')) as InitOptions; }
    catch { throw new UsageError('--json must be valid JSON'); }
    const m = initManifest(opts, new Date().toISOString().slice(0, 10));
    const issues = validateManifest(m).filter((i) => i.level === 'error');
    if (issues.length) throw new ValidationError(JSON.stringify({ issues }));
    mkdirSync(course, { recursive: true });
    saveManifest(course, m);
    return { manifest: m };
  },
  'manifest validate': (a) => {
    const issues = validateManifest(loadManifest(requireFlag(a, 'course')));
    if (issues.some((i) => i.level === 'error')) throw new ValidationError(JSON.stringify({ issues }));
    return { issues };
  },
};

const isMain = (() => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch { return false; }
})();

if (isMain) process.exitCode = await runCli(process.argv.slice(2), coreCommands);
