import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, "..", ".env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  voyage: {
    apiKey: required("VOYAGE_API_KEY"),
    model: optional("VOYAGE_EMBED_MODEL", "voyage-3"),
  },
  anthropic: {
    apiKey: required("ANTHROPIC_API_KEY"),
    model: optional("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
  },
  pg: {
    host: optional("PGVECTOR_HOST", "localhost"),
    port: Number(optional("PGVECTOR_PORT", "5433")),
    user: optional("PGVECTOR_USER", "knowledge"),
    password: optional("PGVECTOR_PASSWORD", "knowledge"),
    database: optional("PGVECTOR_DATABASE", "knowledge"),
  },
  ingest: {
    docsDir: optional("KNOWLEDGE_DOCS_DIR", "docs"),
    chunkTokens: Number(optional("CHUNK_TOKENS", "400")),
    chunkOverlapTokens: Number(optional("CHUNK_OVERLAP_TOKENS", "60")),
  },
  projectRoot: resolve(here, ".."),
};
