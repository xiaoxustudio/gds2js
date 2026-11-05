import type { CompatIndex, ModuleChunk, SearchRow } from "./types";

const BASE = import.meta.env.BASE_URL;

const moduleCache = new Map<string, Promise<ModuleChunk>>();
let searchCache: Promise<SearchRow[]> | null = null;

function slug(id: string): string {
  return id.replace(/[^A-Za-z0-9_-]+/g, "-");
}

async function json<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}data/v1/${path}`);
  if (!res.ok) throw new Error(`加载失败：${path} (${String(res.status)})`);
  return (await res.json()) as T;
}

export function loadIndex(): Promise<CompatIndex> {
  return json<CompatIndex>("index.json");
}

export function loadModule(id: string): Promise<ModuleChunk> {
  let hit = moduleCache.get(id);
  if (hit === undefined) {
    hit = json<ModuleChunk>(`modules/${slug(id)}.json`);
    moduleCache.set(id, hit);
  }
  return hit;
}

export function loadSearch(): Promise<SearchRow[]> {
  if (searchCache === null) searchCache = json<SearchRow[]>("search.json");
  return searchCache;
}
