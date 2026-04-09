type Session = {
  activeTopic: string | null;
  createdAt: string;
};

type EmotionalProgressProps = {
  recentSessions: Session[];
  topicLabel: (topic: string | null) => string;
};

function getEncouragementMessage(count: number): string {
  if (count === 1) {
    return "Has dado el primer paso. Eso ya es valiente.";
  }
  if (count <= 3) {
    return `Llevas ${count} conversaciones. Est\u00e1s construyendo un h\u00e1bito de autocuidado.`;
  }
  return `Llevas ${count} conversaciones. Eso dice mucho de tu compromiso contigo.`;
}

function getDominantTopic(sessions: Session[]): string | null {
  const counts: Record<string, number> = {};

  for (const session of sessions) {
    if (session.activeTopic) {
      counts[session.activeTopic] = (counts[session.activeTopic] ?? 0) + 1;
    }
  }

  let maxTopic: string | null = null;
  let maxCount = 0;

  for (const [topic, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxTopic = topic;
      maxCount = count;
    }
  }

  // Only consider it dominant if it appears more than once
  return maxCount > 1 ? maxTopic : null;
}

export function EmotionalProgress({ recentSessions, topicLabel }: EmotionalProgressProps) {
  if (recentSessions.length === 0) {
    return null;
  }

  const encouragement = getEncouragementMessage(recentSessions.length);
  const dominantTopic = getDominantTopic(recentSessions);

  return (
    <div className="rounded-[1.5rem] border border-rose-200/40 bg-gradient-to-b from-white/90 to-rose-50/40 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.08)]">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
        Tu proceso
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl text-stone-900">
        {encouragement}
      </h2>
      {dominantTopic ? (
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Tu tema m&aacute;s frecuente es{" "}
          <span className="font-medium text-rose-600">{topicLabel(dominantTopic).toLowerCase()}</span>.
          Flavia nota que es importante para ti.
        </p>
      ) : null}
    </div>
  );
}
