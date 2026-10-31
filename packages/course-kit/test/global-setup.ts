import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Every test run gets one scratch root. Tests create their temp folders with mkdtempSync(tmpdir()),
 * so pointing TMPDIR here keeps them all in one place, and teardown removes it. Without this, each
 * run left course copies and renderer installs behind in the system temp directory.
 */
export default function setup(): () => void {
  const root = mkdtempSync(join(tmpdir(), 'course-kit-tests-'));
  const previous = process.env.TMPDIR;
  process.env.TMPDIR = root;
  return () => {
    if (previous === undefined) delete process.env.TMPDIR; else process.env.TMPDIR = previous;
    rmSync(root, { recursive: true, force: true });
  };
}
