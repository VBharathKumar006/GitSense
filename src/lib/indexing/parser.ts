import { CodeChunk } from "@/types/repository";

export interface ParsedSymbol {
  name: string;
  type: "function" | "class" | "module" | "block";
  startLine: number;
  endLine: number;
  content: string;
}

export function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return "TypeScript";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "JavaScript";
    case "py":
      return "Python";
    case "go":
      return "Go";
    case "rs":
      return "Rust";
    case "java":
      return "Java";
    case "rb":
      return "Ruby";
    case "php":
      return "PHP";
    case "css":
    case "scss":
      return "CSS";
    case "html":
      return "HTML";
    case "json":
      return "JSON";
    case "md":
    case "mdx":
      return "Markdown";
    case "yml":
    case "yaml":
      return "YAML";
    case "sh":
    case "bash":
      return "Shell";
    default:
      return "Text";
  }
}

export function extractImportsAndExports(code: string, language: string): {
  imports: string[];
  exports: string[];
} {
  const imports: string[] = [];
  const exports: string[] = [];

  const lines = code.split("\n");

  if (language === "TypeScript" || language === "JavaScript") {
    for (const line of lines) {
      const trimmed = line.trim();
      // Match ES6 import: import ... from '...';
      const importMatch = trimmed.match(/import\s+(?:.+?\s+from\s+)?['"]([^'"]+)['"]/);
      if (importMatch) {
        imports.push(importMatch[1]);
      }
      // Match require: const x = require('...');
      const reqMatch = trimmed.match(/require\(['"]([^'"]+)['"]\)/);
      if (reqMatch) {
        imports.push(reqMatch[1]);
      }
      // Match export: export (default)? (function|class|const|let|var|type|interface) name
      const exportMatch = trimmed.match(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface)\s+([a-zA-Z0-9_$]+)/);
      if (exportMatch) {
        exports.push(exportMatch[1]);
      }
    }
  } else if (language === "Python") {
    for (const line of lines) {
      const trimmed = line.trim();
      // Match: import x or from x import y
      const pyImport = trimmed.match(/^(?:from\s+([a-zA-Z0-9_.]+)\s+import|import\s+([a-zA-Z0-9_.]+))/);
      if (pyImport) {
        imports.push(pyImport[1] || pyImport[2]);
      }
      // Match top-level def or class
      const pyDef = trimmed.match(/^(?:def|class)\s+([a-zA-Z0-9_]+)/);
      if (pyDef) {
        exports.push(pyDef[1]);
      }
    }
  }

  return { imports, exports };
}

export function chunkCodeFile(
  filePath: string,
  content: string,
  maxChunkLines = 60,
  minChunkLines = 8
): CodeChunk[] {
  const language = detectLanguage(filePath);
  const lines = content.split("\n");
  const fileName = filePath.split("/").pop() || filePath;
  const chunks: CodeChunk[] = [];
  const { imports, exports } = extractImportsAndExports(content, language);

  // If the file is small, make it a single module chunk
  if (lines.length <= maxChunkLines) {
    return [
      {
        id: `${filePath}#L1-L${lines.length}`,
        filePath,
        fileName,
        language,
        startLine: 1,
        endLine: lines.length,
        content: content.trim(),
        type: "module",
        name: fileName,
        imports,
        exports,
      },
    ];
  }

  // Heuristic language-aware boundary extraction
  const functionRegex =
    language === "Python"
      ? /^(def\s+|class\s+|async\s+def\s+)([a-zA-Z0-9_]+)/
      : /^(export\s+)?(default\s+)?(async\s+)?(function\s+|class\s+|const\s+([a-zA-Z0-9_$]+)\s*=\s*(async\s*)?\()/;

  const boundaries: { line: number; name?: string; type: "function" | "class" | "block" }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (functionRegex.test(line.trim())) {
      let name = "anonymous";
      if (language === "Python") {
        const m = line.trim().match(/^(?:def|class|async\s+def)\s+([a-zA-Z0-9_]+)/);
        if (m) name = m[1];
      } else {
        const m = line.trim().match(/(?:function|class|const|let)\s+([a-zA-Z0-9_$]+)/);
        if (m) name = m[1];
      }
      boundaries.push({
        line: i + 1,
        name,
        type: line.includes("class") ? "class" : "function",
      });
    }
  }

  // If we found meaningful function/class boundaries, chunk using them
  if (boundaries.length > 0) {
    for (let b = 0; b < boundaries.length; b++) {
      const start = boundaries[b].line;
      const end = b < boundaries.length - 1 ? boundaries[b + 1].line - 1 : lines.length;
      const chunkLines = lines.slice(start - 1, end);

      // If chunk is too large, split it further
      if (chunkLines.length > maxChunkLines * 1.5) {
        for (let sub = 0; sub < chunkLines.length; sub += maxChunkLines) {
          const subSlice = chunkLines.slice(sub, sub + maxChunkLines);
          const subStart = start + sub;
          const subEnd = Math.min(start + sub + subSlice.length - 1, end);
          chunks.push({
            id: `${filePath}#L${subStart}-L${subEnd}`,
            filePath,
            fileName,
            language,
            startLine: subStart,
            endLine: subEnd,
            content: subSlice.join("\n"),
            type: boundaries[b].type,
            name: `${boundaries[b].name} (part ${Math.floor(sub / maxChunkLines) + 1})`,
            imports,
            exports,
          });
        }
      } else {
        chunks.push({
          id: `${filePath}#L${start}-L${end}`,
          filePath,
          fileName,
          language,
          startLine: start,
          endLine: end,
          content: chunkLines.join("\n"),
          type: boundaries[b].type,
          name: boundaries[b].name,
          imports,
          exports,
        });
      }
    }
  } else {
    // Fallback: sliding window with overlap
    const step = maxChunkLines - 10;
    for (let i = 0; i < lines.length; i += step) {
      const slice = lines.slice(i, i + maxChunkLines);
      if (slice.length < minChunkLines && chunks.length > 0) break;
      const start = i + 1;
      const end = Math.min(i + slice.length, lines.length);

      chunks.push({
        id: `${filePath}#L${start}-L${end}`,
        filePath,
        fileName,
        language,
        startLine: start,
        endLine: end,
        content: slice.join("\n"),
        type: "block",
        imports,
        exports,
      });
    }
  }

  return chunks;
}
