"use client";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { generateId, sm2 } from "@/lib/ai";
import { BookOpen, Plus, RotateCcw, ChevronRight, Flame } from "lucide-react";
import type { Flashcard } from "@/store/appStore";

export function FlashcardsPage() {
  const { profile, flashcards, addFlashcards, updateFlashcard, getDueFlashcards, addXP } = useAppStore();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"browse" | "review" | "generate">("browse");
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const dueCards = getDueFlashcards();

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: 8, apiKey: profile.apiKey, provider: profile.apiProvider }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      const now = new Date();
      const cards: Flashcard[] = data.cards.map((c: { front: string; back: string }) => ({
        id: generateId(), front: c.front, back: c.back, topic,
        nextReview: now, interval: 0, easeFactor: 2.5, repetitions: 0,
      }));
      addFlashcards(cards);
      addXP(20);
      setMode("browse");
      setTopic("");
    } catch { setError("Failed to generate flashcards."); }
    finally { setLoading(false); }
  };

  const startReview = () => {
    const q = dueCards.length > 0 ? dueCards : flashcards.slice(0, 10);
    setReviewQueue(q);
    setCurrentIdx(0);
    setFlipped(false);
    setReviewDone(false);
    setReviewed(0);
    setMode("review");
  };

  const rate = (quality: number) => {
    const card = reviewQueue[currentIdx];
    const { interval, repetitions, easeFactor, nextReview } = sm2(quality, card.repetitions, card.easeFactor, card.interval);
    updateFlashcard(card.id, { interval, repetitions, easeFactor, nextReview });
    if (quality >= 3) addXP(5);
    const next = currentIdx + 1;
    setReviewed((r) => r + 1);
    if (next >= reviewQueue.length) { setReviewDone(true); return; }
    setCurrentIdx(next);
    setFlipped(false);
  };

  const byTopic = flashcards.reduce<Record<string, Flashcard[]>>((acc, c) => {
    if (!acc[c.topic]) acc[c.topic] = [];
    acc[c.topic].push(c);
    return acc;
  }, {});

  if (mode === "generate") {
    return (
      <div className="animate-fade-up">
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setMode("browse")}>← Back</button>
            <h1 className="page-title" style={{ fontSize: 24 }}>Generate Flashcards</h1>
          </div>
        </div>
        <div className="glass-card-static" style={{ padding: 32, maxWidth: 500 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Topic</label>
            <input className="input" placeholder="e.g. Photosynthesis, React Hooks, Spanish Verbs..." value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} />
          </div>
          {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "var(--radius-sm)", color: "#f87171", fontSize: 13 }}>{error}</div>}
          <button className="btn btn-primary btn-lg" onClick={generate} disabled={!topic.trim() || loading} style={{ width: "100%" }}>
            {loading ? <><div className="spinner" /> Generating...</> : <><BookOpen size={18} /> Generate 8 Flashcards</>}
          </button>
        </div>
      </div>
    );
  }

  if (mode === "review") {
    if (reviewDone || reviewQueue.length === 0) {
      return (
        <div className="animate-fade-up" style={{ maxWidth: 500, margin: "0 auto", textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Session Complete!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>You reviewed {reviewed} flashcard{reviewed !== 1 ? "s" : ""}. Keep it up!</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={() => setMode("browse")}><RotateCcw size={16} /> Back to Decks</button>
            {dueCards.length > 0 && <button className="btn btn-primary" onClick={startReview}><Flame size={16} /> Review More</button>}
          </div>
        </div>
      );
    }

    const card = reviewQueue[currentIdx];
    const pct = ((currentIdx) / reviewQueue.length) * 100;

    return (
      <div className="animate-fade-up" style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setMode("browse")}>← Exit</button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{currentIdx + 1} / {reviewQueue.length}</span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 28 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className={`flashcard${flipped ? " flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>Question</div>
                <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>{card.front}</p>
                <p style={{ marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>Tap to reveal answer</p>
              </div>
            </div>
            <div className="flashcard-back">
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--purple-400)", marginBottom: 16 }}>Answer</div>
                <p style={{ fontSize: 16, color: "var(--text-primary)", lineHeight: 1.6 }}>{card.back}</p>
              </div>
            </div>
          </div>
        </div>
        {flipped && (
          <div style={{ marginTop: 24 }}>
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>How well did you know this?</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { q: 1, label: "Forgot", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" },
                { q: 3, label: "Hard", color: "var(--amber-400)", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)" },
                { q: 4, label: "Good", color: "var(--cyan-400)", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.3)" },
                { q: 5, label: "Easy", color: "var(--emerald-400)", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" },
              ].map(({ q, label, color, bg, border }) => (
                <button key={q} onClick={() => rate(q)} style={{ flex: 1, padding: "12px 0", background: bg, border: `1px solid ${border}`, borderRadius: "var(--radius-sm)", color, cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginTop: 12, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "var(--radius-sm)", padding: "8px 14px", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--purple-400)" }}>🔬 SM-2 Algorithm · Next review scheduled based on your rating</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="page-title">Flashcards</h1>
            <p className="page-subtitle">Spaced repetition with the SM-2 algorithm for long-term retention</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {flashcards.length > 0 && <button className="btn btn-primary" onClick={startReview}><Flame size={14} /> Review {dueCards.length > 0 ? `(${dueCards.length} due)` : "All"}</button>}
            <button className="btn btn-ghost" onClick={() => setMode("generate")}><Plus size={14} /> Generate</button>
          </div>
        </div>
      </div>

      {flashcards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No Flashcards Yet</h3>
          <p>Generate flashcards on any topic and the SM-2 algorithm will schedule your reviews for maximum retention.</p>
          <button className="btn btn-primary" onClick={() => setMode("generate")}><Plus size={16} /> Generate Flashcards</button>
        </div>
      ) : (
        <div>
          {dueCards.length > 0 && (
            <div style={{ marginBottom: 24, padding: "16px 20px", background: "linear-gradient(135deg,rgba(251,191,36,0.1),rgba(249,115,22,0.05))", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Flame size={20} style={{ color: "var(--amber-400)" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{dueCards.length} cards due for review</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Keep your streak going!</div>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={startReview}>Start Review</button>
            </div>
          )}
          <div className="grid-2">
            {Object.entries(byTopic).map(([t, cards]) => {
              const due = cards.filter((c) => new Date(c.nextReview) <= new Date()).length;
              return (
                <div key={t} className="glass-card" style={{ padding: 20, cursor: "pointer" }} onClick={startReview}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{t}</div>
                    {due > 0 && <span className="badge badge-amber">{due} due</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>{cards.length} cards</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${((cards.length - due) / cards.length) * 100}%` }} /></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                    <span>{cards.length - due} memorized</span><span>{due} to review</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, color: "var(--purple-400)", fontSize: 13, fontWeight: 600 }}>
                    <ChevronRight size={14} /> Start reviewing
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
