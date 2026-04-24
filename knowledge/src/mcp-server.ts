#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { config } from "./config.ts";
import { closePool, listDocuments, searchChunks } from "./db.ts";
import { embedQuery } from "./embedder.ts";

const SearchArgs = z.object({
  query: z.string().min(1, "query must not be empty"),
  limit: z.number().int().min(1).max(20).optional(),
});

const AskArgs = z.object({
  question: z.string().min(1, "question must not be empty"),
  limit: z.number().int().min(1).max(20).optional(),
});

const server = new Server(
  {
    name: "impulso-knowledge",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_knowledge",
      description:
        "Semantic search across the Impulso knowledge base (markdown docs in knowledge/docs/). Returns the top-K matching chunks with source path, heading path and similarity score.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Natural-language search query." },
          limit: {
            type: "integer",
            description: "Number of chunks to return (1–20, default 5).",
            minimum: 1,
            maximum: 20,
          },
        },
        required: ["query"],
      },
    },
    {
      name: "ask_knowledge",
      description:
        "Answer a question grounded on the Impulso knowledge base. Retrieves relevant chunks via semantic search, then asks Claude to synthesize a cited answer.",
      inputSchema: {
        type: "object",
        properties: {
          question: { type: "string", description: "Question in natural language." },
          limit: {
            type: "integer",
            description: "Number of chunks to retrieve as context (1–20, default 6).",
            minimum: 1,
            maximum: 20,
          },
        },
        required: ["question"],
      },
    },
    {
      name: "list_documents",
      description:
        "List every document indexed in the knowledge base (path, title, chunk count).",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params;

  if (name === "search_knowledge") {
    const args = SearchArgs.parse(rawArgs ?? {});
    const limit = args.limit ?? 5;
    const queryEmbedding = await embedQuery(args.query);
    const rows = await searchChunks(queryEmbedding, limit);

    if (rows.length === 0) {
      return {
        content: [{ type: "text", text: "No matches in the knowledge base." }],
      };
    }

    const formatted = rows
      .map((r, i) => {
        const score = (1 - r.distance).toFixed(3);
        const heading = r.heading_path ? ` — ${r.heading_path}` : "";
        return `### [${i + 1}] ${r.source_path}${heading}\nscore=${score}\n\n${r.content}`;
      })
      .join("\n\n---\n\n");

    return { content: [{ type: "text", text: formatted }] };
  }

  if (name === "ask_knowledge") {
    const args = AskArgs.parse(rawArgs ?? {});
    const limit = args.limit ?? 6;
    const queryEmbedding = await embedQuery(args.question);
    const rows = await searchChunks(queryEmbedding, limit);

    if (rows.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "I have nothing in the knowledge base that touches this question.",
          },
        ],
      };
    }

    const contextBlock = rows
      .map((r, i) => {
        const heading = r.heading_path ? ` (${r.heading_path})` : "";
        return `[${i + 1}] ${r.source_path}${heading}\n${r.content}`;
      })
      .join("\n\n---\n\n");

    const message = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: 1024,
      system:
        "You answer questions strictly from the provided Impulso knowledge-base excerpts. Cite the sources you used as [n] matching the numbered excerpts. If the excerpts do not contain the answer, say so plainly.",
      messages: [
        {
          role: "user",
          content: `Question: ${args.question}\n\nExcerpts:\n${contextBlock}`,
        },
      ],
    });

    const answer = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((b) => b.text)
      .join("\n");

    const sources = rows
      .map((r, i) => `[${i + 1}] ${r.source_path}${r.heading_path ? ` — ${r.heading_path}` : ""}`)
      .join("\n");

    return {
      content: [
        { type: "text", text: `${answer}\n\n---\nSources:\n${sources}` },
      ],
    };
  }

  if (name === "list_documents") {
    const docs = await listDocuments();
    if (docs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Knowledge base is empty. Run `npm run ingest` to index docs.",
          },
        ],
      };
    }
    const text = docs
      .map((d) => `- ${d.source_path}${d.title ? ` — ${d.title}` : ""} (${d.chunks} chunks)`)
      .join("\n");
    return { content: [{ type: "text", text }] };
  }

  return {
    isError: true,
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
  };
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[impulso-knowledge] MCP server ready (stdio)");
}

const shutdown = async () => {
  await closePool();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((err) => {
  console.error("[impulso-knowledge] fatal:", err);
  process.exit(1);
});
