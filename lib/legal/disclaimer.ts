// ===========================================================================
// DISCLAIMER MÉDICO / AVISO LEGAL — FlavIA
// Plantilla editable. Revisar con abogado antes del lanzamiento comercial.
// ===========================================================================

import type { LegalSection } from "./terms";
export type { LegalSection };
export {
  LEGAL_ENTITY_NAME,
  LEGAL_EMAIL,
  LEGAL_DATE,
  APP_NAME,
} from "./terms";

import { LEGAL_ENTITY_NAME, LEGAL_EMAIL, LEGAL_DATE, APP_NAME } from "./terms";

export const disclaimerSections: LegalSection[] = [
  {
    id: "no_terapia",
    title: "1. El servicio no es terapia ni atención médica",
    content: [
      `${APP_NAME} es una plataforma de orientación sobre bienestar sexual y emocional. El asistente de inteligencia artificial, los contenidos editoriales y cualquier interacción en la plataforma tienen un propósito informativo y de acompañamiento general. No constituyen bajo ninguna circunstancia:`,
      `• Diagnóstico, tratamiento o prevención de enfermedades físicas, mentales o psiquiátricas.`,
      `• Atención psicológica, psicoterapéutica o psiquiátrica.`,
      `• Asesoramiento médico o farmacológico.`,
      `• Atención sexológica clínica.`,
    ],
  },
  {
    id: "profesional",
    title: "2. Consulte a un profesional calificado",
    content: [
      `El contenido de ${APP_NAME} no sustituye la consulta presencial o en línea con profesionales de la salud habilitados: psicólogos, psiquiatras, médicos, sexólogos clínicos u otros especialistas con licencia vigente.`,
      `Si experimenta síntomas de ansiedad, depresión, crisis emocionales, pensamientos de hacerse daño u otras condiciones de salud mental, le recomendamos buscar atención profesional de inmediato.`,
    ],
  },
  {
    id: "emergencias",
    title: "3. Emergencias — Líneas de crisis",
    content: [
      `Si usted o alguien de su entorno se encuentra en una situación de crisis o emergencia, contacte de inmediato a:`,
      `• Colombia: Línea 106 (Salud Mental) — disponible 24/7.`,
      `• Colombia: Emergencias generales 123.`,
      `• Estados Unidos: 988 Suicide & Crisis Lifeline (llamar o enviar SMS al 988).`,
      `• Brasil: CVV — Centro de Valorización de la Vida: 188 (24h).`,
      `• Internacional: www.findahelpline.com`,
      `${APP_NAME} no ofrece atención de crisis. Ante una emergencia, llame a los servicios de urgencias locales.`,
    ],
  },
  {
    id: "ia_limitaciones",
    title: "4. Limitaciones de la inteligencia artificial",
    content: [
      `El asistente de IA de ${APP_NAME} es un modelo de lenguaje entrenado con información general. Puede cometer errores, malinterpretar el contexto o proporcionar información desactualizada. Sus respuestas no deben tomarse como verdad absoluta.`,
      `Las conversaciones son procesadas por proveedores externos de IA (OpenAI, Anthropic) con los que mantenemos acuerdos de confidencialidad. Sin embargo, por la naturaleza de la tecnología, le recomendamos no compartir información que considere extremadamente sensible (datos bancarios, documentos de identidad, información de terceros sin su consentimiento).`,
    ],
  },
  {
    id: "profesionales_verificados",
    title: "5. Profesionales verificados en la comunidad",
    content: [
      `${APP_NAME} ofrece un proceso de verificación voluntaria para profesionales de la salud (psicólogos, sexólogos, médicos) que deseen identificarse como tales en la comunidad. La verificación confirma que el profesional ha presentado documentación de titulación, pero no implica que ${APP_NAME} avale, supervise o sea responsable de las opiniones o consejos que dicho profesional comparta en la plataforma.`,
      `Las respuestas de profesionales verificados en la comunidad son opiniones personales y no constituyen consulta clínica formal.`,
    ],
  },
  {
    id: "contenido_adultos",
    title: "6. Contenido para adultos",
    content: [
      `${APP_NAME} aborda temáticas de sexualidad, intimidad y relaciones que pueden incluir contenido explícito para adultos. El servicio está restringido a personas mayores de 18 años. Al acceder, el usuario confirma ser mayor de edad según la legislación de su país de residencia.`,
    ],
  },
  {
    id: "responsabilidad",
    title: "7. Exención de responsabilidad",
    content: [
      `El usuario asume toda la responsabilidad por el uso que haga de la información, orientaciones o contenidos de ${APP_NAME}. ${LEGAL_ENTITY_NAME} no se hace responsable de las consecuencias directas o indirectas derivadas de decisiones tomadas con base en el contenido de la plataforma.`,
      `Este aviso legal complementa los Términos de Uso y la Política de Privacidad de ${APP_NAME}, que deben ser leídos en conjunto.`,
    ],
  },
  {
    id: "contacto",
    title: "8. Contacto",
    content: [
      `Para preguntas sobre este aviso o sobre el servicio: ${LEGAL_EMAIL}.`,
      `Última actualización: ${LEGAL_DATE}.`,
    ],
  },
];
