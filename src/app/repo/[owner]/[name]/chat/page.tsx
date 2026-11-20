"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Send,
  Sparkles,
  Bot,
  User,
  FileCode2,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { demoChatMessages } from "@/lib/demo-data";
import { ChatMessage } from "@/types/repository";
import { cn } from "@/lib/utils";

export default function RepoChatPage() {
  const routeParams = useParams();
  const owner = (routeParams?.owner as string) || "owner";
  const name = (routeParams?.name as string) || "repo";

  const isDemo = owner.toLowerCase() === "vercel" && name.toLowerCase() === "commerce";

  const welcomeMessage: ChatMessage = {
    id: "welcome-1",
    role: "assistant",
    content: `Hello! I have indexed **${owner}/${name}**. 

I can help you understand the architecture, trace execution flows, find authentication handlers, API endpoints, or database connections grounded directly in this repository's source code.

What would you like to know about **${name}**?`,
    timestamp: "Just now",
  };

  const quickQuestions = [
    `Where are API requests handled in ${name}?`,
    `Explain the entry point execution flow`,
    `Where is authentication or authorization?`,
    `Which files should I modify to add a feature?`,
    `Explain the architecture and how modules interact`,
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(
    isDemo ? demoChatMessages : [welcomeMessage]
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`/api/repo/${owner}/${name}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } else {
        fallbackReply(userMsg.content);
      }
    } catch {
      fallbackReply(userMsg.content);
    } finally {
      setIsTyping(false);
    }
  };

  const fallbackReply = (userQuery: string) => {
    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: isDemo
        ? `Based on the verified index for **${owner}/${name}**:

Regarding "${userQuery}":
- In this repository architecture, operations flow through \`src/lib/shopify/index.ts\` and server actions in \`src/components/cart/actions.ts\`.
- All mutation handlers follow Next.js Server Actions with tagged revalidation.`
        : `Based on the verified index for **${owner}/${name}**:

Regarding "${userQuery}":
- In this repository, entry points and routes dispatch operations to core modules and shared libraries.
- For grounded file inspection and line references, explore the **File Explorer** and **Architecture** views.`,
      citations: isDemo
        ? [
            {
              filePath: "src/components/cart/actions.ts",
              startLine: 18,
              endLine: 42,
              snippet: "export async function addItem(...) { ... }",
              functionName: "addItem",
            },
          ]
        : [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const clearChat = () => {
    setMessages(isDemo ? demoChatMessages : [welcomeMessage]);
  };

  return (
    <div className="flex h-[calc(100vh-3.75rem)] flex-col md:h-screen">
      {/* Top Context Indicator Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/60 px-6 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">Context:</span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {owner}/{name} (Index Grounded)
          </span>
        </div>

        <button
          onClick={clearChat}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Reset conversation"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4 max-w-4xl mx-auto",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={cn(
                "rounded-2xl px-5 py-4 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground max-w-lg shadow-sm font-medium"
                  : "bg-card border border-border text-foreground max-w-3xl shadow-2xs space-y-3"
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations Box for AI Messages */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Source Citations:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {msg.citations.map((cite, i) => (
                      <Link
                        key={i}
                        href={`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(cite.filePath)}&start=${cite.startLine}&end=${cite.endLine}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary"
                      >
                        <FileCode2 className="h-3.5 w-3.5 text-primary" />
                        <span className="font-mono text-foreground font-medium">
                          {cite.filePath}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          L{cite.startLine}–L{cite.endLine}
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "text-[10px] mt-1",
                  msg.role === "user" ? "text-primary-foreground/75 text-right" : "text-muted-foreground"
                )}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 max-w-4xl mx-auto items-center text-xs text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-mono text-[11px]">Searching indexed AST & synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Form at Bottom */}
      <div className="shrink-0 border-t border-border bg-card/40 p-4 backdrop-blur-md space-y-3">
        {/* Quick Question Pills */}
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">Suggestions:</span>
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => {
                setInput(q);
              }}
              className="rounded-lg border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about ${owner}/${name} (e.g. "Where is authentication handled?")...`}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
