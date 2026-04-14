import type { Metadata } from "next";

import { ADMIN_EMAILS } from "@/lib/constants";
import { requireUser } from "@/features/auth/server/require-user";
import {
  FLAVIA_IDENTITY,
  FLAVIA_TONE,
  FLAVIA_VOICE_PATTERNS,
  FLAVIA_VOCABULARY,
  FLAVIA_FRAMEWORKS,
  FLAVIA_TOPIC_GUIDES,
  FLAVIA_RESPONSE_STRUCTURE,
  FLAVIA_BOUNDARIES,
} from "@/lib/ai/prompts/flavia-voice-profile";
// Simple label map for display (not using translations since this is a temp admin page)
const TOPIC_LABELS: Record<string, string> = {
  desire: "Deseo",
  couple_connection: "Conexión en pareja",
  self_connection: "Conexión contigo",
  communication: "Comunicación",
  body_confidence: "Cuerpo",
  routine: "Rutina",
  curiosity: "Curiosidad",
  jealousy: "Celos",
  boundaries: "Límites",
  pleasure: "Placer",
  menopause: "Menopausia",
  erectile_dysfunction: "Erección",
  education: "Educación sexual",
};

export const metadata: Metadata = {
  title: "Revisión — Contenido de Flavia",
  robots: "noindex",
};

export const dynamic = "force-dynamic";

// Dashboard daily quotes (mirrored from messages/es/dashboard.json)
const DAILY_QUOTES = [
  "Lo que no se habla no existe.",
  "El deseo es como un músculo: si lo ejercitas, se hace cada vez más fuerte.",
  "La intimidad no empieza cuando se apaga la luz. Empieza en cómo te miran.",
  "No hay una forma correcta de ser mujer en la cama. Hay tantas formas como mujeres.",
  "Poner un límite no te vuelve fría. Te vuelve clara.",
  "La sexualidad es como LEGO: nunca la armamos de la misma manera.",
  "Los preliminares arrancan cuando termina la relación sexual.",
  "Hay que deconstruirse para construir.",
  "La felicidad no es euforia. La felicidad es sinónimo de tranquilidad.",
  "Una mujer que se libera, libera a otras mujeres.",
];

// Topic opener messages (mirrored from messages/es/shared.json topic_starters)
const TOPIC_OPENERS: Record<string, string> = {
  desire: "Quiero hablar sobre el deseo. Últimamente siento que algo ha cambiado.",
  communication: "Necesito ayuda para comunicar algo que me cuesta decir.",
  couple_connection: "Siento que mi pareja y yo nos estamos desconectando.",
  pleasure: "Quiero explorar el placer sin vergüenza.",
  boundaries: "Me cuesta poner límites en mis relaciones.",
  routine: "Siento que hemos caído en una rutina y no sé cómo salir.",
  self_connection: "Quiero reconectar conmigo misma. Siento que me he desconectado de lo que necesito.",
  jealousy: "Los celos me están afectando y no sé cómo manejarlos.",
  curiosity: "Tengo curiosidad por explorar cosas nuevas pero no sé por dónde empezar.",
  body_confidence: "Me cuesta sentirme cómoda con mi cuerpo y eso afecta mi intimidad.",
  menopause: "Estoy pasando por la menopausia y noto cambios que me preocupan.",
  erectile_dysfunction: "He tenido problemas con la erección y no sé cómo manejarlo.",
  education: "Quiero entender mejor la sexualidad. Siento que me falta educación sexual.",
};

// Dashboard starter card descriptions (from messages/es/dashboard.json)
const STARTER_CARDS: Record<string, string> = {
  desire: "Siento que he perdido las ganas y no sé por qué",
  communication: "No sé cómo decirle lo que necesito",
  couple_connection: "Siento que hemos perdido la chispa",
  pleasure: "Quiero explorar qué me gusta de verdad",
  boundaries: "Me cuesta decir que no sin sentirme culpable",
  routine: "Todo se siente repetitivo y quiero cambiarlo",
  menopause: "Estoy pasando por cambios hormonales y noto que afectan mi intimidad",
  education: "Quiero entender mejor la sexualidad sin tabúes",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-rose-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)]">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-stone-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function QuoteList({ items }: { items: readonly string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="rounded-xl bg-rose-50/50 px-4 py-3 text-sm leading-6 text-stone-700">
          <span className="mr-2 text-xs font-medium text-rose-400">{i + 1}.</span>
          &ldquo;{item}&rdquo;
        </li>
      ))}
    </ol>
  );
}

function DefinitionList({ items }: { items: { term: string; description: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl bg-stone-50/80 px-4 py-3">
          <p className="text-sm font-semibold text-stone-800">{item.term}</p>
          <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export default async function ReviewFlaviaPage() {
  const user = await requireUser();
  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    return <p className="text-stone-500">Acceso restringido.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          Revisión interna — Borrar después de la reunión
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Todo el contenido de &ldquo;Flavia&rdquo; en la app
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Esta página muestra todo lo que la IA dice, usa y sabe como Flavia. Repasa cada sección y dinos qué cambiar.
        </p>
      </div>

      {/* ── 1. Identity ─────────────────────────────────────────────── */}
      <Section title="1. Identidad — Cómo se presenta la IA">
        <DefinitionList
          items={[
            { term: "Nombre", description: FLAVIA_IDENTITY.name },
            { term: "Profesión", description: `${FLAVIA_IDENTITY.profession} con ${FLAVIA_IDENTITY.experience}` },
            { term: "Origen", description: FLAVIA_IDENTITY.origin },
            { term: "Posicionamiento", description: FLAVIA_IDENTITY.positioning },
            { term: "Libros", description: FLAVIA_IDENTITY.books },
            { term: "Filosofía central", description: FLAVIA_IDENTITY.corePhilosophy },
            { term: "Rasgos personales", description: FLAVIA_IDENTITY.personalTraits },
          ]}
        />
      </Section>

      {/* ── 2. Tone ─────────────────────────────────────────────────── */}
      <Section title="2. Tono de voz">
        <DefinitionList
          items={[
            { term: "Resumen", description: FLAVIA_TONE.summary },
            { term: "Adjetivos clave", description: FLAVIA_TONE.adjectives.join(", ") },
            { term: "En su mejor momento", description: FLAVIA_TONE.bestDescription },
            { term: "Nota cultural", description: FLAVIA_TONE.culturalNote },
          ]}
        />
      </Section>

      {/* ── 3. Signature Phrases ───────────────────────────────────── */}
      <Section title="3. Frases firma (citas reales de Flavia)">
        <p className="mb-3 text-xs text-stone-400">
          Las primeras 8 se inyectan en cada conversación. Las demás se usan solo cuando el tema lo pide.
        </p>
        <QuoteList items={FLAVIA_VOICE_PATTERNS.signaturePhrases} />
      </Section>

      {/* ── 4. Daily Quotes ────────────────────────────────────────── */}
      <Section title="4. Frases diarias del dashboard">
        <p className="mb-3 text-xs text-stone-400">
          Se muestra una al día en el dashboard del usuario, rotando.
        </p>
        <QuoteList items={DAILY_QUOTES} />
      </Section>

      {/* ── 5. Topic Opener Messages ──────────────────────────────── */}
      <Section title="5. Mensajes de entrada por tema">
        <p className="mb-3 text-xs text-stone-400">
          Cuando un usuario selecciona un tema, el chat envía automáticamente este mensaje.
        </p>
        <DefinitionList
          items={Object.entries(TOPIC_OPENERS).map(([key, msg]) => ({
            term: TOPIC_LABELS[key as keyof typeof TOPIC_LABELS] ?? key,
            description: msg,
          }))}
        />
      </Section>

      {/* ── 6. Starter Card Descriptions ─────────────────────────── */}
      <Section title="6. Tarjetas de inicio del dashboard">
        <p className="mb-3 text-xs text-stone-400">
          Textos cortos que aparecen en las tarjetas de tema del dashboard.
        </p>
        <DefinitionList
          items={Object.entries(STARTER_CARDS).map(([key, desc]) => ({
            term: TOPIC_LABELS[key as keyof typeof TOPIC_LABELS] ?? key,
            description: desc,
          }))}
        />
      </Section>

      {/* ── 7. Frameworks ──────────────────────────────────────────── */}
      <Section title="7. Marcos terapéuticos">
        <p className="mb-3 text-xs text-stone-400">
          Herramientas conceptuales que usa la IA cuando son relevantes. Los universales se inyectan siempre; los sexuales, solo cuando el tema lo pide.
        </p>
        <DefinitionList
          items={Object.entries(FLAVIA_FRAMEWORKS).map(([key, value]) => ({
            term: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
            description: value,
          }))}
        />
      </Section>

      {/* ── 8. Topic Guides ────────────────────────────────────────── */}
      <Section title="8. Guías por tema (instrucciones específicas para la IA)">
        <p className="mb-3 text-xs text-stone-400">
          Cuando el chat detecta un tema, inyecta estas instrucciones en el prompt. La IA las usa como guía.
        </p>
        <DefinitionList
          items={Object.entries(FLAVIA_TOPIC_GUIDES).map(([key, guide]) => ({
            term: TOPIC_LABELS[key as keyof typeof TOPIC_LABELS] ?? key,
            description: guide,
          }))}
        />
      </Section>

      {/* ── 9. Vocabulary ──────────────────────────────────────────── */}
      <Section title="9. Vocabulario que usa la IA">
        <p className="mb-3 text-xs text-stone-400">
          Palabras que la IA tiende a usar. Las primeras 10 son universales; las de más abajo, solo en contexto íntimo.
        </p>
        <div className="space-y-2">
          {FLAVIA_VOCABULARY.preferred.map((word, i) => (
            <p key={i} className="rounded-xl bg-stone-50/80 px-4 py-2 text-sm text-stone-700">
              <span className="mr-2 text-xs font-medium text-rose-400">{i + 1}.</span>
              {word}
            </p>
          ))}
        </div>
        <h3 className="mt-6 text-sm font-semibold text-stone-800">Vocabulario que EVITA:</h3>
        <ul className="mt-2 space-y-1">
          {FLAVIA_VOCABULARY.avoided.map((word, i) => (
            <li key={i} className="text-sm text-stone-600">
              <span className="mr-1 text-rose-400">✕</span> {word}
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 10. Response Structure ─────────────────────────────────── */}
      <Section title="10. Cómo responde la IA">
        <h3 className="text-sm font-semibold text-stone-800">Pasos:</h3>
        <ol className="mt-2 space-y-1">
          {FLAVIA_RESPONSE_STRUCTURE.steps.map((step, i) => (
            <li key={i} className="text-sm leading-6 text-stone-600">{step}</li>
          ))}
        </ol>
        <h3 className="mt-4 text-sm font-semibold text-stone-800">Reglas:</h3>
        <ul className="mt-2 space-y-1">
          {FLAVIA_RESPONSE_STRUCTURE.rules.map((rule, i) => (
            <li key={i} className="text-sm leading-6 text-stone-600">• {rule}</li>
          ))}
        </ul>
        <h3 className="mt-4 text-sm font-semibold text-stone-800">Formato:</h3>
        <ul className="mt-2 space-y-1">
          {FLAVIA_RESPONSE_STRUCTURE.format.map((fmt, i) => (
            <li key={i} className="text-sm leading-6 text-stone-600">• {fmt}</li>
          ))}
        </ul>
      </Section>

      {/* ── 11. Voice Patterns ─────────────────────────────────────── */}
      <Section title="11. Patrones de voz">
        <h3 className="text-sm font-semibold text-stone-800">Cómo abre conversaciones:</h3>
        <ul className="mt-2 space-y-1">
          {FLAVIA_VOICE_PATTERNS.openers.map((p, i) => (
            <li key={i} className="text-sm text-stone-600">• {p}</li>
          ))}
        </ul>
        <h3 className="mt-4 text-sm font-semibold text-stone-800">Cómo valida:</h3>
        <ul className="mt-2 space-y-1">
          {FLAVIA_VOICE_PATTERNS.validationPatterns.map((p, i) => (
            <li key={i} className="text-sm text-stone-600">• {p}</li>
          ))}
        </ul>
        <h3 className="mt-4 text-sm font-semibold text-stone-800">Estilo de desafío:</h3>
        <p className="mt-1 text-sm leading-6 text-stone-600">{FLAVIA_VOICE_PATTERNS.challengeStyle}</p>
        <h3 className="mt-4 text-sm font-semibold text-stone-800">Ritmo:</h3>
        <p className="mt-1 text-sm leading-6 text-stone-600">{FLAVIA_VOICE_PATTERNS.rhythm}</p>
      </Section>

      {/* ── 12. Boundaries ─────────────────────────────────────────── */}
      <Section title="12. Prohibiciones (lo que la IA NUNCA hace)">
        <ul className="space-y-2">
          {FLAVIA_BOUNDARIES.map((boundary, i) => (
            <li key={i} className="rounded-xl bg-red-50/50 px-4 py-3 text-sm leading-6 text-stone-700">
              {boundary}
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="rounded-[1.5rem] border border-amber-200/50 bg-gradient-to-br from-amber-50/50 via-white/80 to-rose-50/50 p-6 text-center">
        <p className="text-sm text-stone-600">
          Todo lo de esta página se puede cambiar. Dinos qué suena a ti y qué no.
        </p>
        <p className="mt-1 text-xs text-stone-400">
          Esta página se borrará después de la revisión.
        </p>
      </div>
    </div>
  );
}
