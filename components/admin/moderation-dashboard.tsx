"use client";

import { useState, useCallback } from "react";
import { ModerationItem, type ModerationItemData, type ModerationContentType } from "./moderation-item";

type Tab = "pending" | "reported" | "actioned";

type ModerationDashboardProps = {
  pendingItems: ModerationItemData[];
  reportedItems: ModerationItemData[];
  actionedItems: ModerationItemData[];
};

const tabs: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pendiente" },
  { key: "reported", label: "Reportado" },
  { key: "actioned", label: "Resuelto" },
];

export function ModerationDashboard({ pendingItems, reportedItems, actionedItems }: ModerationDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [items, setItems] = useState({
    pending: pendingItems,
    reported: reportedItems,
    actioned: actionedItems,
  });

  const handleAction = useCallback(async (id: string, contentType: ModerationContentType, action: "approve" | "hide" | "remove") => {
    // Optimistic: remove from current list
    setItems((prev) => ({
      pending: prev.pending.filter((i) => !(i.id === id && i.contentType === contentType)),
      reported: prev.reported.filter((i) => !(i.id === id && i.contentType === contentType)),
      actioned: prev.actioned.filter((i) => !(i.id === id && i.contentType === contentType)),
    }));

    try {
      const res = await fetch("/api/community/moderate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId: id, action }),
      });

      if (!res.ok) throw new Error("Failed");

      // Move to actioned with new status
      const statusMap: Record<string, Record<string, string>> = {
        thread: { approve: "published", hide: "hidden", remove: "removed" },
        comment: { approve: "published", hide: "hidden", remove: "removed" },
        story: { approve: "approved", hide: "pending", remove: "rejected" },
      };
      const newStatus = statusMap[contentType]?.[action] ?? "hidden";

      setItems((prev) => ({
        ...prev,
        actioned: [
          { ...pendingItems.find((i) => i.id === id) ?? reportedItems.find((i) => i.id === id) ?? { id, contentType, content: "", isAnonymous: true, status: newStatus, createdAt: "", userId: "" }, status: newStatus },
          ...prev.actioned,
        ],
      }));
    } catch {
      // Revert on failure — just reload
      window.location.reload();
    }
  }, [pendingItems, reportedItems]);

  const currentItems = items[activeTab];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const count = items[tab.key].length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-stone-200 text-stone-600"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items */}
      {currentItems.length > 0 ? (
        <div className="space-y-4">
          {currentItems.map((item) => (
            <ModerationItem
              key={`${item.contentType}-${item.id}`}
              item={item}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-stone-200/60 bg-white/40 p-8 text-center">
          <p className="text-sm text-stone-500">
            {activeTab === "pending" && "No hay contenido pendiente de revision."}
            {activeTab === "reported" && "No hay contenido reportado."}
            {activeTab === "actioned" && "No hay acciones recientes."}
          </p>
        </div>
      )}
    </div>
  );
}
