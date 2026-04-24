# Impulso Knowledge — Tutorial

Sistema de base de conhecimento vetorial para o Impulso. Lê os arquivos
`.md` da pasta `knowledge/docs/`, gera embeddings com a Voyage AI (provedor
recomendado pela Anthropic), armazena tudo em **pgvector** e expõe os dados via
um servidor **MCP** que pode ser plugado no Claude Desktop, no Claude Code, no
Cursor ou em qualquer cliente que fale o protocolo.

```
knowledge/
├── docs/                # markdowns indexados (mova/coloque seus .md aqui)
├── src/
│   ├── chunker.ts       # quebra markdown por heading + overlap
│   ├── embedder.ts      # cliente Voyage AI
│   ├── db.ts            # pool pgvector (pg + pgvector/pg)
│   ├── ingest.ts        # CLI: scaneia docs/, chunk, embeda, grava
│   ├── mcp-server.ts    # MCP server (stdio) com 3 tools
│   └── config.ts        # carrega .env
├── sql/
│   └── init.sql         # schema (tabelas documents/chunks + ivfflat)
├── package.json
├── tsconfig.json
├── .env.example
└── TUTORIAL.md          # este arquivo
```

## 1. Pré-requisitos

- **Docker** (para subir o pgvector).
- **Node.js ≥ 20** (o MCP server roda em Node).
- **Chave da Voyage AI** — https://dash.voyageai.com/ (free tier é suficiente para começar).
- **Chave da Anthropic** — https://console.anthropic.com/ (usada pela tool `ask_knowledge`).

## 2. Configuração

```bash
cd knowledge
cp .env.example .env
# edite .env e preencha VOYAGE_API_KEY e ANTHROPIC_API_KEY
npm install
```

Variáveis principais (`.env`):

| Variável                | Default                | O quê faz                                                      |
|-------------------------|------------------------|----------------------------------------------------------------|
| `VOYAGE_API_KEY`        | —                      | Chave da Voyage AI (obrigatória).                              |
| `VOYAGE_EMBED_MODEL`    | `voyage-3`             | Modelo de embeddings. **Trocar dimensão exige editar `sql/init.sql`** (`vector(N)`). |
| `ANTHROPIC_API_KEY`     | —                      | Usada pela tool `ask_knowledge` (síntese de respostas).        |
| `ANTHROPIC_MODEL`       | `claude-sonnet-4-6`    | Modelo da Anthropic usado na síntese.                          |
| `PGVECTOR_HOST/PORT/...`| `localhost:5433`       | Conexão com o container pgvector.                              |
| `KNOWLEDGE_DOCS_DIR`    | `docs`                 | Pasta varrida pelo ingest (relativa a `knowledge/`).           |
| `CHUNK_TOKENS`          | `400`                  | Tamanho-alvo do chunk (em tokens aproximados).                 |
| `CHUNK_OVERLAP_TOKENS`  | `60`                   | Sobreposição entre chunks adjacentes.                          |

## 3. Subir o banco vetorial

O serviço `pgvector` foi adicionado ao `server/docker-compose.yml`. Ele expõe a
porta **5433** no host (para não colidir com o Postgres principal em 5432) e
monta `knowledge/sql/init.sql` como script de inicialização (cria a extensão
`vector` e as tabelas `documents` / `chunks`).

```bash
cd server
docker compose up -d pgvector
docker compose ps     # impulso-pgvector deve estar healthy
```

Para resetar do zero (apaga todos os embeddings):

```bash
docker compose down -v pgvector
docker compose up -d pgvector
```

## 4. Ingestão dos `.md`

Coloque/mova qualquer `.md` em `knowledge/docs/` (sub-pastas funcionam) e rode:

```bash
cd knowledge
npm run ingest
```

O que acontece:

1. Varre `docs/` recursivamente.
2. Calcula um SHA-256 do arquivo. Se já estiver indexado com o mesmo hash, **pula**.
3. Quebra o markdown respeitando headings, com overlap configurável.
4. Embeda os chunks em lotes de 64 via Voyage AI (`input_type: "document"`).
5. Faz upsert em `documents` e re-grava `chunks` em transação.

Saída esperada:

```
Ingesting markdown from /.../knowledge/docs
+ README.md → 12 chunks
+ README_BACKEND.md → 28 chunks
+ front.md → 18 chunks
= history.md (unchanged, skipping)
Done. Processed 4 file(s).
```

Re-rode `npm run ingest` sempre que editar/adicionar `.md` — só os arquivos
modificados são re-embedados.

## 5. Testar o MCP server localmente

```bash
cd knowledge
npm run mcp
```

O servidor escuta no **stdio** (é assim que o protocolo MCP funciona). Você não
vai interagir com ele direto pelo terminal — ele é montado por um cliente MCP.

Para sanity-check sem cliente, dá pra mandar um JSON-RPC manual:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run --silent mcp
```

Deve listar as 3 tools (`search_knowledge`, `ask_knowledge`, `list_documents`).

## 6. Plugar em um cliente MCP

### 6.1 Claude Desktop

Edite `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
ou `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "impulso-knowledge": {
      "command": "npx",
      "args": ["tsx", "/caminho/absoluto/para/Impulso/knowledge/src/mcp-server.ts"],
      "env": {
        "VOYAGE_API_KEY": "sk-...",
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

> Alternativa de produção: `npm run build` em `knowledge/`, depois aponte
> `command` para `node` e `args` para `dist/mcp-server.js`.

Reinicie o Claude Desktop. As tools aparecem no menu de plugins.

### 6.2 Claude Code (CLI)

```bash
claude mcp add impulso-knowledge \
  -- npx tsx /caminho/absoluto/Impulso/knowledge/src/mcp-server.ts
```

Veja com `claude mcp list`. Variáveis de ambiente herdam do shell ou podem ser
passadas por `--env`.

### 6.3 Cursor / outros

Qualquer cliente compatível com MCP via stdio aceita a mesma config: `command`
+ `args` apontando para `src/mcp-server.ts` (com `tsx`) ou `dist/mcp-server.js`
(após `npm run build`).

## 7. Tools expostas

| Tool               | Argumentos                              | Retorno                                                                 |
|--------------------|------------------------------------------|-------------------------------------------------------------------------|
| `search_knowledge` | `query: string`, `limit?: number (1–20)` | Top-K chunks com `source_path`, `heading_path` e score de similaridade. |
| `ask_knowledge`    | `question: string`, `limit?: number`     | Resposta sintetizada pela Claude API, citando `[n]` por trecho.         |
| `list_documents`   | —                                        | Lista todos os documentos indexados e quantos chunks cada um tem.       |

## 8. Trocando o modelo de embedding

Modelos da Voyage têm dimensões diferentes:

| Modelo            | Dimensão |
|-------------------|----------|
| `voyage-3-lite`   | 512      |
| `voyage-3`        | 1024     |
| `voyage-3-large`  | 1024     |
| `voyage-code-2`   | 1536     |

Trocar exige:

1. Editar `VOYAGE_EMBED_MODEL` no `.env`.
2. Editar `sql/init.sql` — coluna `embedding vector(N)` com a nova dimensão.
3. Recriar o volume: `docker compose down -v pgvector && docker compose up -d pgvector`.
4. `npm run ingest` para re-embedar tudo.

## 9. Troubleshooting

- **`relation "chunks" does not exist`** → o volume `pgvector_data` foi criado
  antes do `init.sql` existir. Rode `docker compose down -v pgvector` e suba de
  novo.
- **`Voyage embeddings failed: 401`** → `VOYAGE_API_KEY` ausente ou inválida.
- **`Voyage embeddings failed: 400 ... dimension`** → a dimensão do modelo não
  bate com `vector(1024)`. Ver §8.
- **MCP não aparece no cliente** → confira o caminho absoluto no config e olhe
  os logs do cliente (Claude Desktop loga em `~/Library/Logs/Claude/`).
- **Resultados ruins** → reduza `CHUNK_TOKENS` (mais granular) ou aumente
  `CHUNK_OVERLAP_TOKENS`. Em corpora > 10k chunks, suba o `lists` do índice
  ivfflat para ~`sqrt(rows)` em `sql/init.sql`.

## 10. Arquitetura em uma linha

`docs/*.md` → `chunker` (heading-aware + overlap) → `embedder` (Voyage AI) →
`pgvector` (`ivfflat` cosine) → `MCP server` (stdio) → cliente Claude → tool
calls `search_knowledge` / `ask_knowledge` / `list_documents`.
