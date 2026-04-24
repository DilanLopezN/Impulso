import pg from "pg";
import pgvector from "pgvector/pg";
import { config } from "./config.ts";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export async function getPool(): Promise<pg.Pool> {
  if (pool) return pool;
  pool = new Pool({
    host: config.pg.host,
    port: config.pg.port,
    user: config.pg.user,
    password: config.pg.password,
    database: config.pg.database,
    max: 5,
  });
  pool.on("connect", async (client) => {
    await pgvector.registerTypes(client);
  });
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export type DocumentRow = {
  id: number;
  source_path: string;
  title: string | null;
  content_hash: string;
};

export type ChunkSearchRow = {
  chunk_id: number;
  document_id: number;
  source_path: string;
  title: string | null;
  heading_path: string | null;
  chunk_index: number;
  content: string;
  distance: number;
};

export async function upsertDocument(
  sourcePath: string,
  title: string | null,
  contentHash: string,
): Promise<{ id: number; changed: boolean }> {
  const p = await getPool();
  const existing = await p.query<DocumentRow>(
    "SELECT id, source_path, title, content_hash FROM documents WHERE source_path = $1",
    [sourcePath],
  );
  if (existing.rowCount && existing.rows[0].content_hash === contentHash) {
    return { id: existing.rows[0].id, changed: false };
  }
  const upserted = await p.query<{ id: number }>(
    `INSERT INTO documents (source_path, title, content_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (source_path) DO UPDATE
       SET title = EXCLUDED.title,
           content_hash = EXCLUDED.content_hash,
           ingested_at = NOW()
     RETURNING id`,
    [sourcePath, title, contentHash],
  );
  return { id: upserted.rows[0].id, changed: true };
}

export async function deleteChunks(documentId: number): Promise<void> {
  const p = await getPool();
  await p.query("DELETE FROM chunks WHERE document_id = $1", [documentId]);
}

export async function insertChunks(
  documentId: number,
  rows: Array<{
    chunkIndex: number;
    headingPath: string | null;
    content: string;
    tokenCount: number;
    embedding: number[];
  }>,
): Promise<void> {
  if (rows.length === 0) return;
  const p = await getPool();
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    for (const row of rows) {
      await client.query(
        `INSERT INTO chunks
           (document_id, chunk_index, heading_path, content, token_count, embedding)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          documentId,
          row.chunkIndex,
          row.headingPath,
          row.content,
          row.tokenCount,
          pgvector.toSql(row.embedding),
        ],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function searchChunks(
  queryEmbedding: number[],
  limit: number,
): Promise<ChunkSearchRow[]> {
  const p = await getPool();
  const result = await p.query<ChunkSearchRow>(
    `SELECT
       c.id            AS chunk_id,
       c.document_id   AS document_id,
       d.source_path   AS source_path,
       d.title         AS title,
       c.heading_path  AS heading_path,
       c.chunk_index   AS chunk_index,
       c.content       AS content,
       c.embedding <=> $1 AS distance
     FROM chunks c
     JOIN documents d ON d.id = c.document_id
     ORDER BY c.embedding <=> $1
     LIMIT $2`,
    [pgvector.toSql(queryEmbedding), limit],
  );
  return result.rows;
}

export async function listDocuments(): Promise<
  Array<{ id: number; source_path: string; title: string | null; chunks: number }>
> {
  const p = await getPool();
  const result = await p.query<{
    id: number;
    source_path: string;
    title: string | null;
    chunks: number;
  }>(
    `SELECT d.id, d.source_path, d.title, COUNT(c.id)::int AS chunks
       FROM documents d
       LEFT JOIN chunks c ON c.document_id = d.id
      GROUP BY d.id
      ORDER BY d.source_path`,
  );
  return result.rows;
}
