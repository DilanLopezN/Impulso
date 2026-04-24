// Markdown-aware chunker. Splits a document along heading boundaries and packs
// adjacent sections into chunks of approximately CHUNK_TOKENS, with a small
// overlap so semantic neighbors stay retrievable.
//
// "Tokens" here uses a cheap heuristic (~4 chars per token). Good enough for
// chunking; embedding cost is computed by the model server itself.

export type Chunk = {
  index: number;
  headingPath: string | null;
  content: string;
  tokenCount: number;
};

const CHARS_PER_TOKEN = 4;

function approxTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

type Section = {
  headingPath: string;
  body: string;
};

function splitIntoSections(markdown: string): Section[] {
  const lines = markdown.split(/\r?\n/);
  const headingStack: { level: number; text: string }[] = [];
  const sections: Section[] = [];
  let currentBody: string[] = [];

  const pushSection = () => {
    if (currentBody.length === 0) return;
    const path = headingStack.map((h) => h.text).join(" > ");
    const body = currentBody.join("\n").trim();
    if (body.length > 0) sections.push({ headingPath: path, body });
    currentBody = [];
  };

  for (const line of lines) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line);
    if (match) {
      pushSection();
      const level = match[1].length;
      const text = match[2].trim();
      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop();
      }
      headingStack.push({ level, text });
      currentBody.push(line);
    } else {
      currentBody.push(line);
    }
  }
  pushSection();
  return sections;
}

function splitLongSection(section: Section, maxTokens: number): Section[] {
  if (approxTokens(section.body) <= maxTokens) return [section];
  // Split on blank lines (paragraphs) and pack greedily.
  const paragraphs = section.body.split(/\n\s*\n/);
  const out: Section[] = [];
  let buffer: string[] = [];
  let bufferTokens = 0;

  const flush = () => {
    if (buffer.length === 0) return;
    out.push({ headingPath: section.headingPath, body: buffer.join("\n\n") });
    buffer = [];
    bufferTokens = 0;
  };

  for (const para of paragraphs) {
    const t = approxTokens(para);
    if (t > maxTokens) {
      // Single paragraph too big — hard-split by character window.
      flush();
      const charWindow = maxTokens * CHARS_PER_TOKEN;
      for (let i = 0; i < para.length; i += charWindow) {
        out.push({
          headingPath: section.headingPath,
          body: para.slice(i, i + charWindow),
        });
      }
      continue;
    }
    if (bufferTokens + t > maxTokens && buffer.length > 0) flush();
    buffer.push(para);
    bufferTokens += t;
  }
  flush();
  return out;
}

export function chunkMarkdown(
  markdown: string,
  opts: { chunkTokens: number; overlapTokens: number },
): Chunk[] {
  const sections = splitIntoSections(markdown).flatMap((s) =>
    splitLongSection(s, opts.chunkTokens),
  );

  const chunks: Chunk[] = [];
  let buffer: Section[] = [];
  let bufferTokens = 0;

  const flush = () => {
    if (buffer.length === 0) return;
    const headingPath = buffer[0].headingPath || null;
    const content = buffer.map((s) => s.body).join("\n\n");
    chunks.push({
      index: chunks.length,
      headingPath,
      content,
      tokenCount: approxTokens(content),
    });
    // Keep the tail of the current buffer as overlap for the next chunk.
    if (opts.overlapTokens > 0) {
      const tail: Section[] = [];
      let tailTokens = 0;
      for (let i = buffer.length - 1; i >= 0; i--) {
        const t = approxTokens(buffer[i].body);
        if (tailTokens + t > opts.overlapTokens && tail.length > 0) break;
        tail.unshift(buffer[i]);
        tailTokens += t;
      }
      buffer = tail;
      bufferTokens = tailTokens;
    } else {
      buffer = [];
      bufferTokens = 0;
    }
  };

  for (const section of sections) {
    const t = approxTokens(section.body);
    if (bufferTokens + t > opts.chunkTokens && buffer.length > 0) flush();
    buffer.push(section);
    bufferTokens += t;
  }
  // Final flush — but skip if it's only the overlap residue from the last chunk.
  if (buffer.length > 0) {
    const content = buffer.map((s) => s.body).join("\n\n");
    const last = chunks[chunks.length - 1];
    if (!last || !last.content.endsWith(content)) {
      chunks.push({
        index: chunks.length,
        headingPath: buffer[0].headingPath || null,
        content,
        tokenCount: approxTokens(content),
      });
    }
  }

  return chunks;
}

export function extractTitle(markdown: string): string | null {
  const match = /^#\s+(.+)$/m.exec(markdown);
  return match ? match[1].trim() : null;
}
