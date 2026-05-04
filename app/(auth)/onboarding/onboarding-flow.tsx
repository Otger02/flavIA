"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { completeOnboarding } from "@/features/auth/server/complete-onboarding";

const TOPICS = [
  { id: "deseo", label: "Deseo" },
  { id: "pareja", label: "Pareja" },
  { id: "comunicacion", label: "Comunicación" },
  { id: "autoconocimiento", label: "Autoconocimiento" },
  { id: "menopausia", label: "Menopausia" },
  { id: "despues_del_parto", label: "Después del parto" },
  { id: "primera_vez", label: "Primera vez" },
  { id: "infidelidad", label: "Infidelidad" },
  { id: "identidad", label: "Identidad" },
  { id: "miedo", label: "Miedo o bloqueo" },
  { id: "otro", label: "Otro" },
] as const;

const RELATIONSHIP_STATUS = [
  { id: "sin_pareja", label: "Sin pareja" },
  { id: "en_pareja", label: "En pareja" },
  { id: "casada_o", label: "Casada/o" },
  { id: "recien_separada_o", label: "Recién separada/o" },
  { id: "abierta", label: "Relación abierta" },
  { id: "prefiero_no_decir", label: "Prefiero no decir" },
] as const;

const PRONOUNS = [
  { id: "ella", label: "ella / la" },
  { id: "el", label: "él / lo" },
  { id: "elle", label: "elle / le" },
  { id: "prefiero_no_decir", label: "Prefiero no decir" },
] as const;

const COUPLED_STATUSES = new Set(["en_pareja", "casada_o"]);

type TopicId = typeof TOPICS[number]["id"];

const TOPIC_PROMPTS: Record<TopicId, { solo: string[]; couple: string[] }> = {
  deseo: {
    couple: [
      "Llevamos tiempo juntos y siento que el deseo se ha apagado",
      "Me cuesta hablar de lo que me gusta con mi pareja",
      "Quiero entender por qué a veces no tengo ganas estando con alguien que quiero",
    ],
    solo: [
      "Últimamente no tengo ganas y no sé si es normal",
      "Quiero explorar qué me gusta pero no sé cómo empezar",
      "Hay algo en mi deseo que me genera confusión",
    ],
  },
  pareja: {
    couple: [
      "Siento que nos hemos distanciado y no sé cómo reconectar",
      "Hay cosas que no sé cómo decirle a mi pareja",
      "Quiero mejorar la intimidad en mi relación",
    ],
    solo: [
      "Me cuesta construir intimidad con alguien nuevo",
      "No sé qué quiero realmente en una relación",
      "Quiero entender mis patrones en el amor",
    ],
  },
  comunicacion: {
    couple: [
      "No sé cómo hablar de sexo con mi pareja sin que se haga raro",
      "Me cuesta pedir lo que quiero en la intimidad",
      "Hay temas que evitamos y no sé cómo abrirlos",
    ],
    solo: [
      "Me cuesta poner límites en mis relaciones íntimas",
      "No sé cómo expresar mis necesidades sin sentirme vulnerable",
      "Hay conversaciones que evito porque no sé cómo abordarlas",
    ],
  },
  autoconocimiento: {
    couple: [
      "Quiero entender mejor mis deseos dentro de mi relación",
      "Siento que he perdido contacto conmigo misma desde que estoy en pareja",
      "Quiero explorar qué necesito más allá de lo que tenemos",
    ],
    solo: [
      "Quiero entender mejor mis deseos y necesidades",
      "Hay cosas de mí misma que me generan curiosidad o confusión",
      "Quiero explorar mi sexualidad de forma más consciente",
    ],
  },
  menopausia: {
    couple: [
      "El deseo ha cambiado desde la menopausia y no sé cómo hablarlo con mi pareja",
      "Mi cuerpo está cambiando y afecta nuestra intimidad",
      "Quiero hablar de esta etapa sin tabúes",
    ],
    solo: [
      "Noto cambios en mi cuerpo desde la menopausia y no sé qué es normal",
      "El deseo ha cambiado y no sé cómo gestionarlo",
      "Quiero hablar de esta etapa sin tabúes",
    ],
  },
  despues_del_parto: {
    couple: [
      "Después del parto nuestra intimidad ha cambiado mucho",
      "Mi pareja lo intenta pero yo no me siento listo/a",
      "Quiero reconectar con mi sexualidad postparto",
    ],
    solo: [
      "Después del parto mi relación con mi cuerpo ha cambiado",
      "No siento el mismo deseo desde que fui padre/madre",
      "Quiero reconectar con mi sexualidad sin presión",
    ],
  },
  primera_vez: {
    couple: [
      "Vamos a tener nuestra primera vez juntos y tengo dudas",
      "Quiero que sea especial pero no sé cómo prepararlo",
      "Me da miedo que sea raro y no sé qué esperar",
    ],
    solo: [
      "Tengo dudas sobre mi primera vez y no sé con quién hablarlas",
      "Me preocupa lo que puede pasar y no sé si es normal",
      "Quiero entender qué esperar sin que nadie me juzgue",
    ],
  },
  infidelidad: {
    couple: [
      "He descubierto una infidelidad y no sé cómo procesar esto",
      "Estamos intentando reconstruir la confianza y es muy difícil",
      "He sido infiel y no sé cómo manejar la culpa y la relación",
    ],
    solo: [
      "He descubierto una infidelidad y no sé qué hacer",
      "Me han sido infiel y siento que no puedo confiar en nadie",
      "He tenido pensamientos de infidelidad y quiero entenderlos",
    ],
  },
  identidad: {
    couple: [
      "Estoy explorando mi identidad sexual y no sé cómo hablarlo con mi pareja",
      "Siento que mis deseos han cambiado y no encajan con mi relación",
      "Quiero entender quién soy sin perder lo que tengo",
    ],
    solo: [
      "Tengo dudas sobre mi orientación sexual y no sé cómo navegarlas",
      "Estoy explorando mi identidad y necesito un espacio seguro",
      "Me siento confundida sobre lo que quiero y quién soy",
    ],
  },
  miedo: {
    couple: [
      "Siento bloqueos en la intimidad con mi pareja y no sé de dónde vienen",
      "Hay algo que me genera miedo en nuestra vida sexual",
      "Me cuesta conectar con mi cuerpo cuando estamos juntos",
    ],
    solo: [
      "Siento bloqueos en situaciones íntimas y no sé de dónde vienen",
      "Hay algo que me genera miedo o ansiedad y quiero entenderlo",
      "Me cuesta conectar con mi cuerpo y quisiera cambiar eso",
    ],
  },
  otro: {
    couple: [
      "Tengo algo en mente sobre nuestra relación pero no sé cómo empezar",
      "Quiero explorar algo contigo sin saber muy bien el qué",
      "Necesito un espacio para hablar sin juicios",
    ],
    solo: [
      "Tengo algo en mente pero no sé cómo empezar a hablarlo",
      "Quiero explorar sin saber muy bien por dónde",
      "Necesito un espacio para hablar sin juicios",
    ],
  },
};

function getSuggestedPrompts(topics: string[], relationshipStatus: string): string[] {
  const isCoupled = COUPLED_STATUSES.has(relationshipStatus);
  const primaryTopic = (topics[0] ?? "otro") as TopicId;
  const map = TOPIC_PROMPTS[primaryTopic] ?? TOPIC_PROMPTS.otro;
  return isCoupled ? map.couple : map.solo;
}

type Step = "welcome" | "personalize" | "suggestions";

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [displayName, setDisplayName] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleTopic(id: string) {
    setTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  }

  async function handlePersonalizeDone() {
    setSaving(true);
    await completeOnboarding({ displayName, relationshipStatus, pronouns });
    setSaving(false);
    setStep("suggestions");
  }

  function handlePromptClick(prompt: string) {
    router.push(`/chat?opening=${encodeURIComponent(prompt)}`);
  }

  function handleFreeChat() {
    router.push("/chat");
  }

  const suggestions = getSuggestedPrompts(topics, relationshipStatus);
  const firstName = displayName.trim().split(" ")[0];

  if (step === "welcome") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#fff8ef_0%,_#f7f3ec_48%,_#efe4d6_100%)] px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-8 h-32 w-32 overflow-hidden rounded-full ring-4 ring-rose-200/40 shadow-[0_12px_40px_rgba(180,100,80,0.18)]">
            <Image
              src="/flavia-bw.jpg"
              alt="Flavia"
              width={128}
              height={128}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-stone-900">
            Hola. Soy Flavia.
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-600">
            Antes de empezar, déjame conocerte un poco para que esto se sienta más nuestro.{" "}
            <span className="text-stone-400">Solo dos minutos.</span>
          </p>
          <button
            type="button"
            onClick={() => setStep("personalize")}
            className="mt-8 w-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.35)]"
          >
            Empezar →
          </button>
          <button
            type="button"
            onClick={handleFreeChat}
            className="mt-3 w-full rounded-full py-2 text-sm text-stone-400 transition hover:text-stone-600"
          >
            Saltar por ahora
          </button>
        </div>
      </div>
    );
  }

  if (step === "personalize") {
    return (
      <div className="flex min-h-screen items-start justify-center bg-[radial-gradient(circle_at_top,_#fff8ef_0%,_#f7f3ec_48%,_#efe4d6_100%)] px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-rose-400">Paso 1 de 1</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight text-stone-900">
              Cuéntame un poco
            </h2>
            <p className="mt-2 text-sm text-stone-500">Todo es opcional. Puedes cambiarlo después.</p>
          </div>

          <div className="rounded-[1.5rem] border border-stone-200/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(180,120,100,0.10)] backdrop-blur space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-stone-700">
                ¿Cómo quieres que te llame?
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre, un alias, o déjalo vacío"
                className="mt-2 w-full rounded-xl border border-stone-300/80 bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-200/50"
              />
            </div>

            {/* Topics */}
            <div>
              <p className="text-sm font-medium text-stone-700">¿Qué te trae aquí? <span className="font-normal text-stone-400">(elige hasta 3)</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TOPICS.map(({ id, label }) => {
                  const selected = topics.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleTopic(id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "bg-rose-500 text-white shadow-sm"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pronouns */}
            <div>
              <p className="text-sm font-medium text-stone-700">Tus pronombres <span className="font-normal text-stone-400">(opcional)</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRONOUNS.map(({ id, label }) => {
                  const selected = pronouns === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPronouns(selected ? "" : id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "bg-rose-500 text-white shadow-sm"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Relationship status */}
            <div>
              <p className="text-sm font-medium text-stone-700">Estado actual de tu vida íntima <span className="font-normal text-stone-400">(opcional)</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {RELATIONSHIP_STATUS.map(({ id, label }) => {
                  const selected = relationshipStatus === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRelationshipStatus(selected ? "" : id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "bg-rose-500 text-white shadow-sm"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handlePersonalizeDone}
            className="w-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.25)] transition duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {saving ? "Guardando..." : "Listo →"}
          </button>
        </div>
      </div>
    );
  }

  // step === "suggestions"
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#fff8ef_0%,_#f7f3ec_48%,_#efe4d6_100%)] px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 shadow-sm">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-rose-400">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-stone-900">
            {firstName ? `Gracias, ${firstName}.` : "Gracias."}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Te dejo en el chat — puedes hablarme de lo que quieras, cuando quieras. Si quieres, aquí tienes algunas conversaciones para empezar.
          </p>
        </div>

        <div className="space-y-3 text-left">
          {suggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="w-full rounded-[1.25rem] border border-rose-200/60 bg-white/80 px-5 py-4 text-left text-sm leading-6 text-stone-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50/60 hover:shadow-md"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleFreeChat}
          className="w-full rounded-full border border-stone-200 bg-white/80 px-6 py-3 text-sm font-medium text-stone-600 shadow-sm transition hover:bg-stone-50"
        >
          Empezar conversación libre →
        </button>
      </div>
    </div>
  );
}
