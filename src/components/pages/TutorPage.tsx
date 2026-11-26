"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { generateId } from "@/lib/ai";
import { Send, Trash2, Sparkles, Bot } from "lucide-react";
import type { Message } from "@/store/appStore";

const SUGGESTIONS = [
  "Explain quantum entanglement simply",
  "How does machine learning work?",
  "Teach me the Pythagorean theorem",
  "What is the Socratic method?",
  "Explain DNA replication step by step",
];

export function TutorPage() {
  const { messages, addMessage, clearMessages, profile, currentTopicContext, addXP } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;
    const userMsg: Message = { id: generateId(), role: "user", content: content.trim(), timestamp: new Date() };
    addMessage(userMsg);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          apiKey: profile.apiKey,
          provider: profile.apiProvider,
          modelId: profile.modelId,
          topic: currentTopicContext,
        }),
      });
      const data = await res.json();
      addMessage({ id: generateId(), role: "assistant", content: data.content || data.error || "Something went wrong.", timestamp: new Date() });
      addXP(10);
    } catch {
      addMessage({ id: generateId(), role: "assistant", content: "Connection error. Please try again.", timestamp: new Date() });
    } finally {
      setLoading(false);
    }
  }, [messages, loading, profile, currentTopicContext, addMessage, addXP]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, `<code style="background:rgba(139,92,246,0.2);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:13px">$1</code>`)
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="animate-fade-up" style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div className="page-header" style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "var(--gradient-primary)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 24, marginBottom: 2 }}>AI Tutor</h1>
            <p className="page-subtitle" style={{ fontSize: 13 }}>Powered by {profile.modelId || 'Meta Llama'} · Adaptive Socratic learning</p>
          </div>
          {messages.length > 0 && (
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={clearMessages}>
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="chat-container" style={{ flex: 1 }}>
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
                Your Personal AI Tutor
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 380, marginBottom: 28, lineHeight: 1.7 }}>
                Ask me anything! I adapt to your level using the Socratic method to build deep understanding — not just surface memorization.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 500 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)}
                    style={{ padding: "8px 14px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--purple-400)", cursor: "pointer", transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.1)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role === "assistant" ? "ai" : "user"}`}>
              <div className={`message-avatar ${msg.role === "assistant" ? "ai" : "user"}`}>
                {msg.role === "assistant" ? "🧠" : profile.name[0].toUpperCase()}
              </div>
              <div className="message-bubble">
                {msg.role === "assistant"
                  ? <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                  : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message ai">
              <div className="message-avatar ai">🧠</div>
              <div className="message-bubble" style={{ display: "flex", gap: 4, alignItems: "center", padding: "14px 16px" }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Ask me anything to learn... (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button className="btn btn-primary" onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{ height: 44, width: 44, padding: 0, borderRadius: "var(--radius-md)", flexShrink: 0 }}>
            {loading ? <div className="spinner" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {!profile.apiKey && (
        <div style={{ marginTop: 8, padding: "8px 16px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Sparkles size={14} style={{ color: "var(--amber-400)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--amber-400)" }}>
            Running in demo mode. Add your Meta Llama or OpenAI API key in <strong>Settings</strong> for real AI responses.
          </span>
        </div>
      )}
    </div>
  );
}
