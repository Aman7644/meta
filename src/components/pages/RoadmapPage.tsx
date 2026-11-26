"use client";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { generateId } from "@/lib/ai";
import { Map, CheckCircle, Lock, PlayCircle, Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { Roadmap, RoadmapStep } from "@/store/appStore";

export function RoadmapPage() {
  const { profile, roadmaps, addRoadmap, addXP } = useAppStore();
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(roadmaps.length === 0);

  const generate = async () => {
    if (!topic.trim() || !goal.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, goal, currentLevel: level, apiKey: profile.apiKey, provider: profile.apiProvider }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      const roadmap: Roadmap = { id: generateId(), topic, goal, steps: data.steps, createdAt: new Date() };
      addRoadmap(roadmap);
      addXP(25);
      setActiveRoadmap(roadmap);
      setShowForm(false);
    } catch { setError("Failed to generate roadmap."); }
    finally { setLoading(false); }
  };

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle size={18} style={{ color: "var(--emerald-400)" }} />;
    if (status === "active") return <PlayCircle size={18} style={{ color: "var(--purple-400)" }} />;
    return <Lock size={18} style={{ color: "var(--text-muted)" }} />;
  };

  const displayed = activeRoadmap || roadmaps[0];

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="page-title">Learning Roadmap</h1>
            <p className="page-subtitle">AI-generated personalized curriculum for any skill</p>
          </div>
          {roadmaps.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={14} /> New Roadmap
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="glass-card-static" style={{ padding: 28, marginBottom: 28, maxWidth: 600 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 20, color: "var(--text-primary)" }}>
            Create Your Roadmap
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>What do you want to learn?</label>
              <input className="input" placeholder="e.g. Machine Learning, Spanish, Web Development..." value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>What is your goal?</label>
              <input className="input" placeholder="e.g. Build a recommendation system, pass DELE B2 exam..." value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Current Level</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["beginner", "intermediate", "advanced"].map((l) => (
                  <button key={l} onClick={() => setLevel(l)}
                    style={{ flex: 1, padding: "10px 0", border: `1px solid ${level === l ? "var(--purple-500)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", background: level === l ? "rgba(139,92,246,0.2)" : "var(--bg-card)", color: level === l ? "var(--purple-400)" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s" }}
                  >{l}</button>
                ))}
              </div>
            </div>
            {error && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "var(--radius-sm)", color: "#f87171", fontSize: 13 }}>{error}</div>}
            <button className="btn btn-primary btn-lg" onClick={generate} disabled={!topic.trim() || !goal.trim() || loading}>
              {loading ? <><div className="spinner" /> Generating...</> : <><Map size={18} /> Generate Roadmap</>}
            </button>
          </div>
        </div>
      )}

      {roadmaps.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {roadmaps.map((r) => (
            <button key={r.id} onClick={() => { setActiveRoadmap(r); setShowForm(false); }}
              style={{ padding: "6px 14px", background: displayed?.id === r.id ? "rgba(139,92,246,0.2)" : "var(--bg-card)", border: `1px solid ${displayed?.id === r.id ? "rgba(139,92,246,0.4)" : "var(--border)"}`, borderRadius: "var(--radius-md)", fontSize: 13, color: displayed?.id === r.id ? "var(--purple-400)" : "var(--text-secondary)", cursor: "pointer" }}
            >{r.topic}</button>
          ))}
        </div>
      )}

      {displayed && !showForm && (
        <div style={{ maxWidth: 700 }}>
          <div style={{ marginBottom: 24, padding: "20px 24px", background: "linear-gradient(135deg,rgba(139,92,246,0.1),rgba(6,182,212,0.05))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Map size={18} style={{ color: "var(--purple-400)" }} />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{displayed.topic}</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 12 }}>🎯 Goal: {displayed.goal}</p>
            <div style={{ display: "flex", gap: 16 }}>
              <span className="badge badge-emerald">✓ {displayed.steps.filter((s) => s.status === "completed").length} done</span>
              <span className="badge badge-purple">▶ {displayed.steps.filter((s) => s.status === "active").length} active</span>
              <span className="badge badge-cyan">{displayed.steps.length} total steps</span>
            </div>
          </div>

          <div>
            {displayed.steps.map((step: RoadmapStep, i: number) => (
              <div key={step.id} className="roadmap-step">
                <div className={`step-number ${step.status}`}>
                  {step.status === "completed" ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ padding: "16px 20px", background: "var(--bg-card)", border: `1px solid ${step.status === "active" ? "rgba(139,92,246,0.3)" : "var(--border)"}`, borderRadius: "var(--radius-md)", cursor: "pointer" }}
                    onClick={() => setExpanded(expanded === step.id ? null : step.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {statusIcon(step.status)}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: step.status === "locked" ? "var(--text-muted)" : "var(--text-primary)" }}>{step.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>⏱ {step.estimatedTime}</div>
                        </div>
                      </div>
                      {expanded === step.id ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />}
                    </div>
                    {expanded === step.id && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>{step.description}</p>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>Resources</div>
                          {step.resources.map((r: string, ri: number) => (
                            <div key={ri} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--purple-400)", flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
