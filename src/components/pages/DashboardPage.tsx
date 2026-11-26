"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { levelFromXP } from "@/lib/ai";
import { Brain, BookOpen, Map, Zap, Clock, TrendingUp, Award, ChevronRight, Flame } from "lucide-react";

export function DashboardPage() {
  const { profile, quizzes, roadmaps, flashcards, getDueFlashcards, setActiveTab } = useAppStore();
  const { level, title, nextXP } = levelFromXP(profile.xp);
  const [dueCards, setDueCards] = useState<ReturnType<typeof getDueFlashcards>>([]);
  useEffect(() => { setDueCards(getDueFlashcards()); }, [getDueFlashcards]);
  const avgScore = quizzes.length
    ? Math.round(quizzes.filter((q) => q.score !== undefined).reduce((a, q) => a + (q.score || 0), 0) / Math.max(1, quizzes.filter((q) => q.score !== undefined).length))
    : 0;
  const xpPct = Math.min(100, (profile.xp / nextXP) * 100);

  const quickActions = [
    { icon: Brain, label: "Chat with AI Tutor", desc: "Ask anything, learn deeply", tab: "tutor", gradient: "linear-gradient(135deg,#8b5cf6,#06b6d4)" },
    { icon: Zap, label: "Take a Quiz", desc: "Test your knowledge", tab: "quiz", gradient: "linear-gradient(135deg,#f472b6,#8b5cf6)" },
    { icon: Map, label: "Build Roadmap", desc: "Plan your learning path", tab: "roadmap", gradient: "linear-gradient(135deg,#34d399,#06b6d4)" },
    { icon: BookOpen, label: "Review Flashcards", desc: `${dueCards.length} cards due today`, tab: "flashcards", gradient: "linear-gradient(135deg,#fbbf24,#f97316)" },
  ];

  return (
    <div className="animate-fade-up">
      {/* Hero welcome */}
      <div style={{ marginBottom: 32, padding: "32px", background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "var(--radius-xl)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -30, left: "40%", width: 160, height: 160, background: "radial-gradient(circle, rgba(6,182,212,0.15), transparent)", borderRadius: "50%" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>👋</span>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>
                Welcome back, {profile.name}!
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                Ready to level up your knowledge today?
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "var(--radius-md)", padding: "8px 16px" }}>
              <Award size={16} style={{ color: "var(--purple-400)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--purple-400)" }}>Level {level} · {title}</span>
            </div>
            {profile.streak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "var(--radius-md)", padding: "8px 16px" }}>
                <Flame size={16} style={{ color: "var(--amber-400)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--amber-400)" }}>{profile.streak} Day Streak</span>
              </div>
            )}
            {dueCards.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "var(--radius-md)", padding: "8px 16px" }}>
                <BookOpen size={16} style={{ color: "var(--cyan-400)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cyan-400)" }}>{dueCards.length} cards to review</span>
              </div>
            )}
          </div>
          {/* XP Progress */}
          <div style={{ marginTop: 20, maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
              <span>{profile.xp} XP</span><span>{nextXP} XP to next level</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: "Total XP", value: profile.xp, icon: "⚡", color: "var(--amber-400)" },
          { label: "Quizzes Taken", value: quizzes.length, icon: "🧠", color: "var(--purple-400)" },
          { label: "Avg. Score", value: `${avgScore}%`, icon: "📊", color: "var(--cyan-400)" },
          { label: "Flashcards", value: flashcards.length, icon: "📚", color: "var(--emerald-400)" },
        ].map((s) => (
          <div key={s.label} className="glass-card stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="section-title">Quick Actions</div>
        <div className="grid-2">
          {quickActions.map((a) => (
            <button
              key={a.tab}
              onClick={() => setActiveTab(a.tab)}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", cursor: "pointer", transition: "all 0.3s ease", textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: 16 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: a.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <a.icon size={22} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{a.desc}</div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {quizzes.length > 0 && (
        <div className="section">
          <div className="section-title">Recent Quizzes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quizzes.slice(0, 4).map((q) => (
              <div key={q.id} className="glass-card-static" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Brain size={16} style={{ color: "var(--purple-400)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{q.topic}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} />{q.questions.length} questions
                  </div>
                </div>
                {q.score !== undefined && (
                  <span className={`badge ${q.score >= 70 ? "badge-emerald" : q.score >= 50 ? "badge-amber" : "badge-purple"}`}>
                    {q.score}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmaps.length > 0 && (
        <div className="section">
          <div className="section-title">Your Roadmaps</div>
          <div className="grid-2">
            {roadmaps.slice(0, 2).map((r) => (
              <div key={r.id} className="glass-card" style={{ padding: 20 }} onClick={() => setActiveTab("roadmap")}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Map size={16} style={{ color: "var(--purple-400)" }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.topic}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>{r.goal}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={12} style={{ color: "var(--emerald-400)" }} />
                  <span style={{ fontSize: 11, color: "var(--emerald-400)" }}>
                    {r.steps.filter((s) => s.status === "completed").length}/{r.steps.length} steps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
