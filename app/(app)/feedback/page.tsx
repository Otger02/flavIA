import { requireUser } from "@/features/auth/server/require-user";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export default async function FeedbackPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          Feedback
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-stone-900">
          Tu voz importa
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-stone-600">
          Cuéntanos qué te gustaría que Flavia hablase, qué contenido te
          ayudaría, o cualquier idea que tengas.
        </p>
      </div>

      <FeedbackForm userId={user.id} />
    </div>
  );
}
