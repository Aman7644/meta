"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { levelFromXP } from "@/lib/ai";
import {
  LayoutDashboard, MessageSquare, Brain, Map, BookOpen, Settings, Zap
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tutor", label: "AI Tutor", icon: MessageSquare },
  { id: "quiz", label: "Quiz", icon: Brain },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "flashcards", label: "Flashcards", icon: BookOpen },
];

export function Sidebar() {
  const { activeTab, setActiveTab, profile, getDueFlashcards } = useAppStore();
  const { level, title, nextXP } = levelFromXP(profile.xp);
  const [due, setDue] = useState(0);
  useEffect(() => { setDue(getDueFlashcards().length); }, [getDueFlashcards]);
  const xpPct = Math.min(100, (profile.xp / nextXP) * 100);

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">🧠</div>
        <span className="logo-text">NeuroLearn</span>
      </div>

      <span className="nav-label">Learn</span>
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-item${activeTab === id ? " active" : ""}`}
          onClick={() => setActiveTab(id)}
        >
          <Icon className="nav-icon" size={18} />
          {label}
          {id === "flashcards" && due > 0 && (
            <span style={{ marginLeft: "auto", background: "var(--gradient-primary)", color: "white", borderRadius: "99px", fontSize: "10px", fontWeight: 700, padding: "2px 7px" }}>
              {due}
            </span>
          )}
        </button>
      ))}

      <span className="nav-label" style={{ marginTop: 16 }}>Account</span>
      <button
        className={`nav-item${activeTab === "settings" ? " active" : ""}`}
        onClick={() => setActiveTab("settings")}
      >
        <Settings size={18} className="nav-icon" />
        Settings
      </button>

      <div style={{ marginTop: "auto" }}>
        <div style={{ padding: "0 4px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
            <span>Level {level} · {title}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--amber-400)" }}>
              <Zap size={11} />{profile.xp} XP
            </span>
          </div>
          <div className="progress-bar" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">{profile.name[0].toUpperCase()}</div>
          <div>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-xp">🔥 {profile.streak} day streak</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
