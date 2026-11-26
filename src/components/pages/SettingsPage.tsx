"use client";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { Settings, Key, User, Save, ExternalLink, CheckCircle, Cpu, Zap } from "lucide-react";
import {
  PROVIDERS,
  MODELS,
  getModelsForProvider,
  getDefaultModel,
  type Provider,
} from "@/lib/ai";

const HACKATHON_PROVIDERS: Provider[] = ["meta", "baseten", "fireworks"];

export function SettingsPage() {
  const { profile, updateProfile } = useAppStore();
  const [name, setName] = useState(profile.name);
  const [apiKey, setApiKey] = useState(profile.apiKey);
  const [provider, setProvider] = useState<Provider>(profile.apiProvider);
  const [modelId, setModelId] = useState(
    profile.modelId || getDefaultModel(profile.apiProvider)
  );
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const availableModels = getModelsForProvider(provider);
  const cfg = PROVIDERS[provider];
  const isHackathonProvider = HACKATHON_PROVIDERS.includes(provider);

  const handleProviderChange = (p: Provider) => {
    setProvider(p);
    // auto-select recommended model for the new provider
    setModelId(getDefaultModel(p));
    if (p === "demo") setApiKey("");
  };

  const save = () => {
    updateProfile({
      name: name || "Learner",
      apiKey,
      apiProvider: provider,
      modelId: provider === "demo" ? "" : modelId,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40, height: 40,
              background: "rgba(139,92,246,0.2)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "var(--radius-md)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Settings size={20} style={{ color: "var(--purple-400)" }} />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 24, marginBottom: 2 }}>Settings</h1>
            <p className="page-subtitle" style={{ fontSize: 13 }}>Configure your AI backend and profile</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Profile ── */}
        <div className="glass-card-static" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <User size={18} style={{ color: "var(--purple-400)" }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Profile</h2>
          </div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Display Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>

        {/* ── Hackathon Banner ── */}
        <div
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Zap size={16} style={{ color: "var(--amber-400)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber-400)" }}>Meta AI Hackathon — Free Credits Included!</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            After acceptance (Oct 26) you'll receive: <strong style={{ color: "var(--text-primary)" }}>Baseten $100</strong> · <strong style={{ color: "var(--text-primary)" }}>Modal $100</strong> · <strong style={{ color: "var(--text-primary)" }}>Fireworks $25</strong>.
            Pick one of the hackathon providers below and paste your credit API key.
          </p>
        </div>

        {/* ── Provider Selection ── */}
        <div className="glass-card-static" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Key size={18} style={{ color: "var(--cyan-400)" }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>AI Provider</h2>
          </div>

          {/* Hackathon providers */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>
            🏆 Hackathon Partners
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {(["meta", "baseten", "fireworks"] as Provider[]).map((p) => {
              const c = PROVIDERS[p];
              const active = provider === p;
              return (
                <button
                  key={p}
                  onClick={() => handleProviderChange(p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    background: active ? "rgba(139,92,246,0.1)" : "var(--bg-card)",
                    border: `1px solid ${active ? "var(--purple-500)" : "var(--border)"}`,
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer", width: "100%", textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${active ? "var(--purple-500)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    {active && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--purple-500)" }} />}
                  </div>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>{c.label}</div>
                    {c.hackathonCredit && (
                      <div style={{ fontSize: 11, color: "var(--amber-400)", fontWeight: 500 }}>🏆 {c.hackathonCredit}</div>
                    )}
                  </div>
                  <a href={c.docsURL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "var(--text-muted)", display: "flex" }}>
                    <ExternalLink size={14} />
                  </a>
                </button>
              );
            })}
          </div>

          {/* Other providers */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>
            Other Providers
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(["openai", "demo"] as Provider[]).map((p) => {
              const c = PROVIDERS[p];
              const active = provider === p;
              return (
                <button
                  key={p}
                  onClick={() => handleProviderChange(p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    background: active ? "rgba(139,92,246,0.1)" : "var(--bg-card)",
                    border: `1px solid ${active ? "var(--purple-500)" : "var(--border)"}`,
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer", width: "100%", textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${active ? "var(--purple-500)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    {active && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--purple-500)" }} />}
                  </div>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.keyHint}</div>
                  </div>
                  {c.docsURL && (
                    <a href={c.docsURL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "var(--text-muted)", display: "flex" }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Model Selector ── */}
        {provider !== "demo" && availableModels.length > 0 && (
          <div className="glass-card-static" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Cpu size={18} style={{ color: "var(--emerald-400)" }} />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                Model — <span style={{ color: "var(--emerald-400)", fontWeight: 500 }}>{PROVIDERS[provider].label}</span>
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {availableModels.map((m) => {
                const active = modelId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px",
                      background: active ? "rgba(52,211,153,0.08)" : "var(--bg-card)",
                      border: `1px solid ${active ? "var(--emerald-500, #10b981)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer", width: "100%", textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 18, height: 18, borderRadius: "50%", marginTop: 2,
                        border: `2px solid ${active ? "#10b981" : "var(--border)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                          {m.label}
                        </span>
                        {m.recommended && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--amber-400)", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 4, padding: "1px 6px" }}>
                            RECOMMENDED
                          </span>
                        )}
                        {m.vision && (
                          <span style={{ fontSize: 10, color: "var(--cyan-400)", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 4, padding: "1px 6px" }}>
                            👁 VISION
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{m.description}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                        Context: {m.contextK >= 1000 ? `${m.contextK / 1000}M` : `${m.contextK}K`} tokens
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── API Key ── */}
        {provider !== "demo" && (
          <div className="glass-card-static" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Key size={18} style={{ color: "var(--purple-400)" }} />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                API Key
              </h2>
            </div>

            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              {cfg.label} Key
              <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>
                — {cfg.keyHint}
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={cfg.keyPlaceholder || "Paste your API key here…"}
                style={{ paddingRight: 60 }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, color: "var(--text-muted)",
                }}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              🔒 Stored locally in your browser — never sent to any third party.
            </p>

            {/* Per-provider instructions */}
            {isHackathonProvider && (
              <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--purple-400)", marginBottom: 6 }}>
                  How to get your {cfg.label} key (Hackathon):
                </div>
                {provider === "meta" && (
                  <ol style={{ paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 2, margin: 0 }}>
                    <li>Visit <a href="https://developers.meta.ai" target="_blank" style={{ color: "var(--cyan-400)" }}>developers.meta.ai</a></li>
                    <li>Sign in with your Meta account</li>
                    <li>Go to <strong>API Keys</strong> in the dashboard</li>
                    <li>Create a new key — it starts with <code>LA-</code></li>
                  </ol>
                )}
                {provider === "baseten" && (
                  <ol style={{ paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 2, margin: 0 }}>
                    <li>Register at <a href="https://app.baseten.co" target="_blank" style={{ color: "var(--cyan-400)" }}>app.baseten.co</a></li>
                    <li>After hackathon acceptance, redeem the $100 credit code from Discord</li>
                    <li>Go to <strong>Settings → API Keys</strong></li>
                    <li>Create a new key and paste above</li>
                  </ol>
                )}
                {provider === "fireworks" && (
                  <ol style={{ paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 2, margin: 0 }}>
                    <li>Sign up at <a href="https://fireworks.ai" target="_blank" style={{ color: "var(--cyan-400)" }}>fireworks.ai</a></li>
                    <li>After hackathon acceptance, apply the $25 credit code from Discord</li>
                    <li>Go to <strong>Account → API Keys</strong></li>
                    <li>Create a new key (starts with <code>fw_</code>)</li>
                  </ol>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Stats ── */}
        <div className="glass-card-static" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Your Stats
          </h2>
          <div className="grid-2">
            {[
              { label: "Total XP", value: profile.xp, icon: "⚡" },
              { label: "Day Streak", value: `${profile.streak} 🔥`, icon: "" },
              { label: "Sessions", value: profile.totalSessions, icon: "📅" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "14px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={save} style={{ width: "100%" }}>
          {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
