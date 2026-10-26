import type { Module } from "../lower/ir";

export async function cachedLower(_src: string, build: () => Promise<Module>): Promise<Module> {
  return build();
}
