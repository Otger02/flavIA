"use client";

import { useState } from "react";

type Tab = "conversaciones" | "historias";

type CommunityTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  threadCount?: number;
  storyCount?: number;
};

export function CommunityTabs({ activeTab, onTabChange, threadCount, storyCount }: CommunityTabsProps) {
  return (
    <div className="flex gap-1 rounded-2xl border border-stone-200/60 bg-white/60 p-1">
      <button
        onClick={() => onTabChange("conversaciones")}
        className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
          activeTab === "conversaciones"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Conversaciones{threadCount !== undefined ? ` (${threadCount})` : ""}
      </button>
      <button
        onClick={() => onTabChange("historias")}
        className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
          activeTab === "historias"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Historias{storyCount !== undefined ? ` (${storyCount})` : ""}
      </button>
    </div>
  );
}

export function CommunityTabsServer({ activeTab }: { activeTab: Tab }) {
  return (
    <div className="flex gap-1 rounded-2xl border border-stone-200/60 bg-white/60 p-1">
      <a
        href="/comunidad?tab=conversaciones"
        className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
          activeTab === "conversaciones"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Conversaciones
      </a>
      <a
        href="/comunidad?tab=historias"
        className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
          activeTab === "historias"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Historias
      </a>
    </div>
  );
}
