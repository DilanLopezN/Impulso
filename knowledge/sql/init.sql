-- Knowledge base schema for Impulso.
-- Runs automatically the first time the pgvector container starts (mounted as
-- /docker-entrypoint-initdb.d/01-init.sql).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
  id           BIGSERIAL PRIMARY KEY,
  source_path  TEXT        NOT NULL UNIQUE,
  title        TEXT,
  content_hash TEXT        NOT NULL,
  ingested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- voyage-3 / voyage-3-large output 1024-dim vectors. Adjust if you switch
-- models (voyage-3-lite = 512, voyage-code-2 = 1536, etc.).
CREATE TABLE IF NOT EXISTS chunks (
  id           BIGSERIAL PRIMARY KEY,
  document_id  BIGINT      NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index  INTEGER     NOT NULL,
  heading_path TEXT,
  content      TEXT        NOT NULL,
  token_count  INTEGER     NOT NULL,
  embedding    vector(1024) NOT NULL,
  UNIQUE (document_id, chunk_index)
);

-- Cosine-distance ANN index. `lists` ~ sqrt(rows); 100 is fine up to ~10k
-- chunks. Bump it if the corpus grows.
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS chunks_document_id_idx ON chunks(document_id);
