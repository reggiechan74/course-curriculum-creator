import { KitError, UsageError } from '../errors.js';

export type ParsedArgs = { positionals: string[]; flags: Record<string, string | boolean> };
export type CommandTable = Record<string, (args: ParsedArgs) => Promise<unknown> | unknown>;

export function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { positionals.push(a); continue; }
    const eq = a.indexOf('=');
    if (eq > 0) { flags[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) { flags[a.slice(2)] = next; i++; }
    else flags[a.slice(2)] = true;
  }
  return { positionals, flags };
}

export function requirePositional(args: ParsedArgs, index: number, name: string): string {
  const v = args.positionals[index];
  if (v === undefined) throw new UsageError(`missing argument: <${name}>`);
  return v;
}

export function requireFlag(args: ParsedArgs, name: string): string {
  const v = args.flags[name];
  if (typeof v !== 'string') throw new UsageError(`missing flag: --${name} <value>`);
  return v;
}

function print(value: unknown): void {
  process.stdout.write(JSON.stringify(value) + '\n');
}

/** Runs the command with the longest positional prefix matching a table key. */
export async function runCli(argv: string[], commands: CommandTable): Promise<number> {
  try {
    const args = parseArgs(argv);
    for (let n = args.positionals.length; n > 0; n--) {
      const handler = commands[args.positionals.slice(0, n).join(' ')];
      if (handler) {
        const result = await handler({ positionals: args.positionals.slice(n), flags: args.flags });
        print(result ?? {});
        return 0;
      }
    }
    throw new UsageError(
      args.positionals.length ? `unknown command: ${args.positionals.join(' ')}` : 'no command given',
    );
  } catch (e) {
    if (e instanceof KitError) { print({ error: e.message }); return e.exitCode; }
    print({ error: e instanceof Error ? e.message : String(e) });
    return 1;
  }
}
