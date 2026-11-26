"use client";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { generateId } from "@/lib/ai";
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, Loader2 } from "lucide-react";
import type { QuizQuestion } from "@/store/appStore";

type Difficulty = "beginner" | "intermediate" | "advanced";

export function QuizPage() {
  const { profile, addQuiz, addXP } = useAppStore();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizTopic, setQuizTopic] = useState("");
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, numQuestions: 5, apiKey: profile.apiKey, provider: profile.apiProvider }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setQuestions(data.questions);
      setQuizTopic(topic);
      setAnswers(new Array(data.questions.length).fill(null));
      setShowResults(false);
    } catch { setError("Failed to generate quiz. Please try again."); }
    finally { setLoading(false); }
  };

  const selectAnswer = (qi: number, oi: number) => {
    if (answers[qi] !== null) return;
    const next = [...answers]; next[qi] = oi; setAnswers(next);
  };

  const submitQuiz = () => {
    const correct = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    const score = Math.round((correct / questions.length) * 100);
    addQuiz({ id: generateId(), topic: quizTopic, questions, score, completedAt: new Date() });
    addXP(score >= 80 ? 50 : score >= 60 ? 30 : 15);
    setShowResults(true);
  };

  const reset = () => { setQuestions([]); setAnswers([]); setShowResults(false); setTopic(""); };

  const score = questions.length ? Math.round((questions.filter((q, i) => answers[i] === q.correctIndex).length / questions.length) * 100) : 0;

  if (showResults) {
    const correct = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    return (
      <div className="animate-fade-up">
        <div className="page-header">
          <h1 className="page-title">Quiz Results</h1>
        </div>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div className="glass-card-static" style={{ padding: 40, textAlign: "center", marginBottom: 24, background: score >= 70 ? "rgba(52,211,153,0.05)" : "rgba(139,92,246,0.05)", borderColor: score >= 70 ? "rgba(52,211,153,0.3)" : "rgba(139,92,246,0.3)" }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>{score >= 80 ? "🏆" : score >= 60 ? "⭐" : "📚"}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 900, background: score >= 70 ? "var(--gradient-success)" : "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
              {score}%
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginTop: 8 }}>
              {correct}/{questions.length} correct · {score >= 80 ? "+50 XP" : score >= 60 ? "+30 XP" : "+15 XP"} earned!
            </div>
            <div style={{ color: "var(--text-secondary)", marginTop: 8 }}>
              {score >= 80 ? "Excellent work! You have mastered this topic." : score >= 60 ? "Good job! A bit more practice and you'll ace it." : "Keep going! Review the explanations below."}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div key={i} className="glass-card-static" style={{ padding: 18, borderColor: isCorrect ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    {isCorrect ? <CheckCircle size={18} style={{ color: "var(--emerald-400)", flexShrink: 0, marginTop: 1 }} /> : <XCircle size={18} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />}
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{q.question}</span>
                  </div>
                  {!isCorrect && (
                    <div style={{ marginLeft: 28, fontSize: 13, color: "var(--emerald-400)", marginBottom: 4 }}>
                      ✓ Correct: {q.options[q.correctIndex]}
                    </div>
                  )}
                  <div style={{ marginLeft: 28, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{q.explanation}</div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary btn-lg" onClick={reset} style={{ width: "100%" }}>
            <RotateCcw size={16} /> Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  if (questions.length > 0) {
    const answered = answers.filter((a) => a !== null).length;
    const pct = (answered / questions.length) * 100;
    return (
      <div className="animate-fade-up">
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="page-title">{quizTopic}</h1>
              <p className="page-subtitle">{answered}/{questions.length} answered · {difficulty}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={reset}><RotateCcw size={14} /> New Quiz</button>
          </div>
          <div className="progress-bar" style={{ marginTop: 16 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 700 }}>
          {questions.map((q, qi) => (
            <div key={qi} className="glass-card-static" style={{ padding: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Question {qi + 1} of {questions.length}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, lineHeight: 1.6 }}>{q.question}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, oi) => {
                  let cls = "quiz-option";
                  if (answers[qi] !== null) {
                    if (oi === q.correctIndex) cls += " reveal-correct";
                    else if (oi === answers[qi]) cls += " selected-wrong";
                  }
                  return (
                    <button key={oi} className={cls} onClick={() => selectAnswer(qi, oi)} disabled={answers[qi] !== null}>
                      <span style={{ fontWeight: 600, marginRight: 8, color: "var(--text-muted)" }}>{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answers[qi] !== null && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
        {answered === questions.length && (
          <div style={{ marginTop: 24, maxWidth: 700 }}>
            <button className="btn btn-primary btn-lg" onClick={submitQuiz} style={{ width: "100%" }}>
              <Trophy size={18} /> View Results
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Quiz Generator</h1>
        <p className="page-subtitle">Test your knowledge on any topic with AI-generated questions</p>
      </div>
      <div style={{ maxWidth: 560 }}>
        <div className="glass-card-static" style={{ padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Topic</label>
            <input
              className="input"
              placeholder="e.g. React Hooks, Photosynthesis, The French Revolution..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Difficulty</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={{ flex: 1, padding: "10px 0", border: `1px solid ${difficulty === d ? "var(--purple-500)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", background: difficulty === d ? "rgba(139,92,246,0.2)" : "var(--bg-card)", color: difficulty === d ? "var(--purple-400)" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s" }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "var(--radius-sm)", color: "#f87171", fontSize: 13 }}>{error}</div>}
          <button className="btn btn-primary btn-lg" onClick={startQuiz} disabled={!topic.trim() || loading} style={{ width: "100%" }}>
            {loading ? <><div className="spinner" /> Generating Quiz...</> : <><Brain size={18} /> Generate 5-Question Quiz</>}
          </button>
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
            5 adaptive multiple-choice questions · Instant explanations
          </p>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Popular Topics</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["JavaScript", "Machine Learning", "World History", "Calculus", "Biology", "Python", "Physics", "Economics"].map((t) => (
              <button key={t} onClick={() => setTopic(t)}
                style={{ padding: "6px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.4)"; (e.currentTarget as HTMLElement).style.color = "var(--purple-400)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
