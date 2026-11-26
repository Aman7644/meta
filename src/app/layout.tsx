import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "NeuroLearn AI — Personalized Learning Platform",
  description: "AI-powered personalized learning with adaptive tutoring, quizzes, roadmaps, and spaced repetition. Built with Meta Llama.",
  keywords: ["AI learning", "personalized education", "Meta Llama", "adaptive tutoring", "spaced repetition"],
  openGraph: {
    title: "NeuroLearn AI",
    description: "Your AI-powered personalized learning companion",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
