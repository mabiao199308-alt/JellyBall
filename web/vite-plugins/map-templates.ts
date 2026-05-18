import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = resolve(__dirname, "../src/config/map_templates");
const MAPS_DIR = resolve(__dirname, "../src/config/maps");
const FILE_NAME_RE = /^[A-Za-z0-9._-]+\.json$/;
const DIFFICULTIES = ["easy", "normal", "hard"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value);
}

function difficultyDir(diff: Difficulty) {
  return resolve(TEMPLATES_DIR, diff);
}

async function ensureDirs() {
  await fs.mkdir(TEMPLATES_DIR, { recursive: true });
  await Promise.all(DIFFICULTIES.map((d) => fs.mkdir(difficultyDir(d), { recursive: true })));
}

async function ensureMapsDir() {
  await fs.mkdir(MAPS_DIR, { recursive: true });
}

function resolveSafeMapFilePath(name: string): string | null {
  if (!FILE_NAME_RE.test(name)) return null;
  const filePath = resolve(MAPS_DIR, name);
  if (!filePath.startsWith(MAPS_DIR + "/") && filePath !== MAPS_DIR) return null;
  return filePath;
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(body).toString());
  res.end(body);
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, rejectBody) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", rejectBody);
  });
}

async function listDifficulty(diff: Difficulty): Promise<string[]> {
  const dir = difficultyDir(diff);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".json"))
    .map((e) => e.name)
    .sort((a, b) => b.localeCompare(a));
}

function resolveSafeFilePath(diff: Difficulty, name: string): string | null {
  if (!FILE_NAME_RE.test(name)) return null;
  const dir = difficultyDir(diff);
  const filePath = resolve(dir, name);
  if (!filePath.startsWith(dir + "/") && filePath !== dir) return null;
  return filePath;
}

export function mapTemplatesPlugin(): Plugin {
  return {
    name: "jellyball:map-templates",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        const isTemplateApi = url.startsWith("/api/template-library");
        const isMapsApi = url.startsWith("/api/maps");
        if (!isTemplateApi && !isMapsApi) return next();

        try {
          if (isMapsApi) {
            await ensureMapsDir();

            if (req.method === "GET" && url === "/api/maps/list") {
              const entries = await fs.readdir(MAPS_DIR, { withFileTypes: true });
              const files = entries
                .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".json"))
                .map((e) => e.name)
                .sort((a, b) => b.localeCompare(a));
              return sendJson(res, 200, { ok: true, files });
            }

            if (req.method === "GET" && url.startsWith("/api/maps/get?")) {
              const name = new URL(url, "http://localhost").searchParams.get("name") || "";
              const filePath = resolveSafeMapFilePath(name);
              if (!filePath) return sendJson(res, 400, { ok: false, error: "非法文件名或路径" });
              const raw = await fs.readFile(filePath, "utf-8");
              return sendJson(res, 200, { ok: true, name, map: JSON.parse(raw) });
            }

            if (req.method === "POST" && url === "/api/maps/save") {
              const raw = await readBody(req);
              const payload = JSON.parse(raw);
              const name: string = payload?.name;
              const map = payload?.map;
              if (!name || !FILE_NAME_RE.test(name)) {
                return sendJson(res, 400, { ok: false, error: "非法文件名" });
              }
              if (!map || typeof map !== "object") {
                return sendJson(res, 400, { ok: false, error: "map 不能为空" });
              }
              const filePath = resolveSafeMapFilePath(name);
              if (!filePath) return sendJson(res, 400, { ok: false, error: "路径越界" });
              await fs.writeFile(filePath, JSON.stringify(map, null, 2), "utf-8");
              return sendJson(res, 200, { ok: true, name, path: filePath });
            }

            return sendJson(res, 404, { ok: false, error: "未知接口" });
          }

          await ensureDirs();

          if (req.method === "GET" && url === "/api/template-library/list") {
            const groups: Record<string, string[]> = {};
            for (const d of DIFFICULTIES) groups[d] = await listDifficulty(d);
            const files = DIFFICULTIES.flatMap((d) => groups[d].map((name) => `${d}/${name}`));
            return sendJson(res, 200, { ok: true, groups, files });
          }

          if (req.method === "GET" && url.startsWith("/api/template-library/get?")) {
            const params = new URL(url, "http://localhost").searchParams;
            const diff = params.get("difficulty") || "";
            const name = params.get("name") || "";
            if (!isDifficulty(diff)) {
              return sendJson(res, 400, { ok: false, error: "难度参数非法" });
            }
            const filePath = resolveSafeFilePath(diff, name);
            if (!filePath) return sendJson(res, 400, { ok: false, error: "非法文件名或路径" });
            const raw = await fs.readFile(filePath, "utf-8");
            return sendJson(res, 200, { ok: true, difficulty: diff, name, library: JSON.parse(raw) });
          }

          if (req.method === "POST" && url === "/api/template-library/save") {
            const raw = await readBody(req);
            const payload = JSON.parse(raw);
            const diff = payload?.difficulty;
            const name: string = payload?.name;
            const library = payload?.library;
            if (!isDifficulty(diff)) {
              return sendJson(res, 400, { ok: false, error: "难度参数非法" });
            }
            if (!name || !FILE_NAME_RE.test(name)) {
              return sendJson(res, 400, { ok: false, error: "非法文件名" });
            }
            if (!library || typeof library !== "object") {
              return sendJson(res, 400, { ok: false, error: "library 不能为空" });
            }
            const filePath = resolveSafeFilePath(diff, name);
            if (!filePath) return sendJson(res, 400, { ok: false, error: "路径越界" });
            await fs.writeFile(filePath, JSON.stringify(library, null, 2), "utf-8");
            return sendJson(res, 200, { ok: true, difficulty: diff, name, path: filePath });
          }

          return sendJson(res, 404, { ok: false, error: "未知接口" });
        } catch (err) {
          return sendJson(res, 500, {
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    },
  };
}
