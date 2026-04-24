import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { config } from "./config.ts";
import { chunkMarkdown, extractTitle } from "./chunker.ts";
import { embedTexts } from "./embedder.ts";
import {
  closePool,
  deleteChunks,
  insertChunks,
  upsertDocument,
} from "./db.ts";

const BATCH_SIZE = 64;

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) yield full;
  }
}

function hash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function ingestFile(absolutePath: string, docsRoot: string): Promise<void> {
  const sourcePath = relative(docsRoot, absolutePath);
  const raw = await readFile(absolutePath, "utf8");
  const contentHash = hash(raw);
  const title = extractTitle(raw);

  const { id: documentId, changed } = await upsertDocument(sourcePath, title, contentHash);
  if (!changed) {
    console.log(`= ${sourcePath} (unchanged, skipping)`);
    return;
  }

  await deleteChunks(documentId);

  const chunks = chunkMarkdown(raw, {
    chunkTokens: config.ingest.chunkTokens,
    overlapTokens: config.ingest.chunkOverlapTokens,
  });

  if (chunks.length === 0) {
    console.log(`! ${sourcePath} produced 0 chunks (empty file?)`);
    return;
  }

  const rows: Array<{
    chunkIndex: number;
    headingPath: string | null;
    content: string;
    tokenCount: number;
    embedding: number[];
  }> = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embeddings = await embedTexts(
      batch.map((c) => c.content),
      "document",
    );
    batch.forEach((c, j) => {
      rows.push({
        chunkIndex: c.index,
        headingPath: c.headingPath,
        content: c.content,
        tokenCount: c.tokenCount,
        embedding: embeddings[j],
      });
    });
  }

  await insertChunks(documentId, rows);
  console.log(`+ ${sourcePath} → ${rows.length} chunks`);
}

async function main(): Promise<void> {
  const docsRoot = resolve(config.projectRoot, config.ingest.docsDir);
  try {
    const s = await stat(docsRoot);
    if (!s.isDirectory()) throw new Error(`${docsRoot} is not a directory`);
  } catch {
    throw new Error(`Docs directory not found: ${docsRoot}`);
  }

  console.log(`Ingesting markdown from ${docsRoot}`);
  let count = 0;
  for await (const file of walk(docsRoot)) {
    await ingestFile(file, docsRoot);
    count++;
  }
  console.log(`Done. Processed ${count} file(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closePool());
