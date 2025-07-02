// import fs from "fs/promises";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FLAGS_PATH = path.resolve(__dirname, "../flags.json");

console.log('the flagsgetflags path is', FLAGS_PATH);

export type FeatureFlags = Record<string, boolean>;

export async function readFlags(): Promise<FeatureFlags> {
  const data = await fs.readFile(FLAGS_PATH, "utf-8");
  return JSON.parse(data);
}

export async function writeFlags(flags: FeatureFlags): Promise<void> {
  await fs.writeFile(FLAGS_PATH, JSON.stringify(flags, null, 2));
}

export async function setFlag(key: string, value: boolean): Promise<void> {
  const flags = await readFlags();
  flags[key] = value;
  await writeFlags(flags);
}

export async function removeFlag(key: string): Promise<void> {
  const flags = await readFlags();
  delete flags[key];
  await writeFlags(flags);
}

export async function getFlag(key: string): Promise<boolean | undefined> {
  const flags = await readFlags();
  return flags[key];
}
