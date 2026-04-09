import type { CommunityThread } from "@/features/community/types";
import { ThreadCard } from "./thread-card";

type ThreadListProps = {
  threads: CommunityThread[];
};

export function ThreadList({ threads }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200/60 bg-white/40 p-10 text-center">
        <p className="text-sm text-stone-500">
          Todavia no hay conversaciones. Se la primera en abrir una.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
