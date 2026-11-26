"use client";
import { ParticleBackground } from "./ParticleBackground";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/store/appStore";
import { DashboardPage } from "./pages/DashboardPage";
import { TutorPage } from "./pages/TutorPage";
import { QuizPage } from "./pages/QuizPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { FlashcardsPage } from "./pages/FlashcardsPage";
import { SettingsPage } from "./pages/SettingsPage";

const pages: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  tutor: TutorPage,
  quiz: QuizPage,
  roadmap: RoadmapPage,
  flashcards: FlashcardsPage,
  settings: SettingsPage,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { activeTab } = useAppStore();
  const Page = pages[activeTab] || DashboardPage;

  return (
    <>
      <ParticleBackground />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Page />
          <div style={{ display: "none" }}>{children}</div>
        </main>
      </div>
    </>
  );
}
