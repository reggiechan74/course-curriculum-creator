import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { estimatePlan, loadPlan } from '../media/plan.js';
import { loadPricing } from '../media/pricing.js';
import { generateAssetImage } from '../providers/generate.js';
import { resolveOpenAIKey } from '../providers/openai.js';

export type ServerDeps = { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; dataDir?: string };

type ToolResult = { isError?: boolean; content: { type: 'text'; text: string }[] };
const ok = (value: unknown): ToolResult => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] });
const fail = (text: string): ToolResult => ({ isError: true, content: [{ type: 'text', text }] });

const quality = z.enum(['draft', 'standard', 'high']).optional()
  .describe('draft | standard | high (OpenAI low | medium | high). Default: standard.');

export function createServer(deps: ServerDeps = {}): McpServer {
  const env = deps.env ?? process.env;
  const { dataDir, fetchImpl } = deps;
  const server = new McpServer({ name: 'course-media', version: '0.1.0' });

  /** Runs fn when an OpenAI key is configured; turns every error into an MCP error result. */
  const guarded = async (fn: () => Promise<unknown> | unknown): Promise<ToolResult> => {
    if (resolveOpenAIKey(env, dataDir) === null) {
      return fail(`course-media is not configured: set openai_api_key, OPENAI_API_KEY, or ${dataDir ?? '<dataDir>'}/openai.key`);
    }
    try { return ok(await fn()); }
    catch (e) { return fail(e instanceof Error ? e.message : String(e)); }
  };

  server.registerTool('generate_image', {
    title: 'Generate a course image (OpenAI gpt-image-2)',
    description: 'Generates the image for an approved media-plan item of kind image with OpenAI gpt-image-2. '
      + 'Spends money: refuses when the estimate would go above media.budgetUsd in course.yaml. Returns the registry asset.',
    inputSchema: {
      courseDir: z.string().min(1).describe('Absolute path of the course folder (contains course.yaml).'),
      assetId: z.string().min(1).describe('The media-plan item id, e.g. A-M1-01.'),
      quality,
    },
  }, ({ courseDir, assetId, quality: q }) => guarded(() =>
    generateAssetImage(courseDir, assetId, 'openai', { quality: q ?? 'standard', dataDir, env, fetchImpl })));

  server.registerTool('estimate_cost', {
    title: 'Estimate media plan cost',
    description: 'Estimates the USD cost and plan-image quota of the media plan, per module and in total. No spend.',
    inputSchema: {
      courseDir: z.string().min(1).describe('Absolute path of the course folder (contains course.yaml).'),
      quality,
    },
  }, ({ courseDir, quality: q }) => guarded(() =>
    estimatePlan(loadPlan(courseDir), loadPricing(dataDir), q ?? 'standard')));

  return server;
}

const isMain = (() => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch { return false; }
})();

if (isMain) {
  const server = createServer({ env: process.env, dataDir: process.env.COURSE_MEDIA_DATA_DIR || undefined });
  await server.connect(new StdioServerTransport());
}
