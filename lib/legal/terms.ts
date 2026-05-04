// ===========================================================================
// TÉRMINOS DE USO — FlavIA
// Plantilla editable. Buscar y reemplazar los [PLACEHOLDER_*] antes de publicar
// definitivamente. Revisar con abogado antes del lanzamiento comercial.
// ===========================================================================

// ── Variables editables ────────────────────────────────────────────────────
export const LEGAL_ENTITY_NAME = "[PLACEHOLDER_NOMBRE_ENTIDAD]"; // ej: "María Flavia Torres" o "FlavIA SAS"
export const LEGAL_ENTITY_ID = "[PLACEHOLDER_NIT_O_CEDULA]"; // NIT o cédula
export const LEGAL_EMAIL = "[PLACEHOLDER_EMAIL_LEGAL]"; // ej: legal@flavia.app
export const LEGAL_DATE = "[PLACEHOLDER_FECHA_VIGENCIA]"; // ej: "1 de mayo de 2026"
export const LEGAL_JURISDICTION = "Colombia"; // jurisdicción primaria
export const APP_NAME = "FlavIA";
export const APP_URL = "https://flavia.app";

// ── Estructura de contenido ────────────────────────────────────────────────
export type LegalSection = {
  id: string;
  title: string;
  content: string[];
};

export const termsSections: LegalSection[] = [
  {
    id: "objeto",
    title: "1. Objeto y aceptación",
    content: [
      `${APP_NAME} es una plataforma digital que ofrece orientación sobre bienestar sexual, emocional y relacional mediante contenido editorial, conversaciones con inteligencia artificial y herramientas de autoconocimiento. El servicio es operado por ${LEGAL_ENTITY_NAME} (en adelante "el Operador").`,
      `Al acceder o utilizar ${APP_URL} o cualquier aplicación o servicio asociado, el usuario acepta íntegramente estos Términos de Uso. Si no está de acuerdo con alguna de estas condiciones, debe abstenerse de usar el servicio.`,
    ],
  },
  {
    id: "elegibilidad",
    title: "2. Elegibilidad y edad mínima",
    content: [
      `El acceso a ${APP_NAME} está restringido a personas mayores de 18 años. Al registrarse, el usuario declara, bajo su propia responsabilidad, ser mayor de edad conforme a la legislación del país donde reside.`,
      `El Operador no puede verificar la edad de los usuarios de forma independiente. Si se tiene conocimiento de que un menor de edad ha accedido al servicio, se procederá a cancelar su cuenta y eliminar sus datos.`,
    ],
  },
  {
    id: "cuenta",
    title: "3. Registro y seguridad de la cuenta",
    content: [
      `Para acceder a las funcionalidades personalizadas, el usuario debe registrarse proporcionando una dirección de correo electrónico válida. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.`,
      `El Operador se reserva el derecho de suspender o eliminar cuentas que incumplan estos Términos, que presenten actividad fraudulenta o que no hayan tenido actividad durante un período prolongado.`,
    ],
  },
  {
    id: "servicio",
    title: "4. Descripción del servicio",
    content: [
      `${APP_NAME} ofrece los siguientes servicios principales: (a) conversaciones con un asistente de inteligencia artificial orientadas al bienestar sexual y emocional; (b) biblioteca de contenido editorial; (c) comunidad de usuarios moderada; (d) recomendaciones de recursos y productos seleccionados.`,
      `El servicio se ofrece en modalidad gratuita (con funcionalidades limitadas) y de pago (Flavia Plus), con las características descritas en la página de planes. Los precios y características de cada plan pueden modificarse con previo aviso.`,
    ],
  },
  {
    id: "disclaimer_ia",
    title: "5. Naturaleza del asistente de IA — No es terapia",
    content: [
      `El asistente de inteligencia artificial de ${APP_NAME} proporciona información y orientación de carácter general sobre bienestar sexual y emocional. Sus respuestas NO constituyen diagnóstico médico, psicológico o psiquiátrico, ni asesoramiento terapéutico profesional.`,
      `El servicio no sustituye en ningún caso la consulta con profesionales de la salud mental, psicólogos, sexólogos, médicos u otros especialistas calificados. Ante cualquier situación de crisis emocional, salud mental o emergencia, el usuario debe contactar de inmediato a los servicios de emergencia locales o a un profesional de la salud.`,
      `El uso del asistente de IA se realiza bajo la exclusiva responsabilidad del usuario. El Operador no se hace responsable de las decisiones tomadas basándose en las respuestas del asistente.`,
    ],
  },
  {
    id: "contenido_usuario",
    title: "6. Contenido generado por el usuario",
    content: [
      `Al publicar contenido en la comunidad u otras áreas participativas, el usuario otorga al Operador una licencia no exclusiva, libre de regalías, para usar, reproducir, modificar y distribuir dicho contenido con el fin de operar y mejorar el servicio.`,
      `El usuario es el único responsable del contenido que publica. Está prohibido publicar contenido que: sea ilegal, difamatorio u obsceno; incite al odio o la violencia; viole derechos de terceros; o sea material publicitario no autorizado.`,
      `El Operador puede moderar, editar o eliminar cualquier contenido sin previo aviso si considera que infringe estos Términos o las normas de la comunidad.`,
    ],
  },
  {
    id: "pago",
    title: "7. Pagos y facturación",
    content: [
      `Los planes de pago se facturan de forma recurrente (mensual o anual) a través de Stripe, proveedor de pagos certificado PCI-DSS. El Operador no almacena datos de tarjetas de crédito.`,
      `El usuario puede cancelar su suscripción en cualquier momento desde su página de cuenta. La cancelación surte efecto al final del período de facturación en curso; no se realizan reembolsos por el tiempo no utilizado, salvo obligación legal.`,
      `Los precios mostrados incluyen los impuestos aplicables según la legislación de ${LEGAL_JURISDICTION}. Para usuarios en otras jurisdicciones, los impuestos locales pueden aplicar adicionalmente.`,
    ],
  },
  {
    id: "afiliados",
    title: "8. Recomendaciones y enlaces de afiliados",
    content: [
      `${APP_NAME} puede incluir recomendaciones de productos o servicios de terceros. Algunos de estos enlaces pueden ser enlaces de afiliados, lo que significa que el Operador puede recibir una comisión si el usuario realiza una compra a través de ellos.`,
      `Las recomendaciones se realizan de buena fe y con base en criterios de calidad y pertinencia para la comunidad. La existencia de relaciones comerciales no influye en las conversaciones del asistente de IA.`,
    ],
  },
  {
    id: "propiedad_intelectual",
    title: "9. Propiedad intelectual",
    content: [
      `Todo el contenido de ${APP_NAME} — incluyendo textos, imágenes, diseño, código fuente, marca y logotipo — es propiedad del Operador o de sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables en ${LEGAL_JURISDICTION}.`,
      `El usuario no puede reproducir, distribuir, modificar ni crear obras derivadas de ningún elemento del servicio sin autorización previa y escrita del Operador.`,
    ],
  },
  {
    id: "limitacion_responsabilidad",
    title: "10. Limitación de responsabilidad",
    content: [
      `El servicio se ofrece "tal cual" y "según disponibilidad". El Operador no garantiza que el servicio sea ininterrumpido, libre de errores o completamente seguro.`,
      `En la máxima medida permitida por la ley colombiana, el Operador no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso del servicio.`,
      `La responsabilidad total del Operador frente al usuario no podrá exceder la cantidad pagada por el usuario al Operador en los últimos 12 meses.`,
    ],
  },
  {
    id: "modificaciones",
    title: "11. Modificaciones al servicio y a los Términos",
    content: [
      `El Operador se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios materiales se comunicarán por correo electrónico o mediante aviso destacado en la plataforma, con al menos 15 días de anticipación.`,
      `El uso continuado del servicio tras la notificación de cambios constituye la aceptación de los nuevos Términos. Si el usuario no acepta los cambios, debe cancelar su cuenta antes de la fecha de entrada en vigor.`,
    ],
  },
  {
    id: "legislacion",
    title: "12. Legislación aplicable y resolución de disputas",
    content: [
      `Estos Términos se rigen por las leyes de la República de ${LEGAL_JURISDICTION}. Cualquier disputa que surja en relación con este acuerdo se someterá a la jurisdicción de los tribunales competentes de ${LEGAL_JURISDICTION}.`,
      `Para usuarios en Estados Unidos o Brasil, el Operador puede adaptar estas condiciones conforme a los requisitos legales locales aplicables.`,
    ],
  },
  {
    id: "contacto",
    title: "13. Contacto",
    content: [
      `Para cualquier consulta sobre estos Términos, el usuario puede contactar al Operador en: ${LEGAL_EMAIL}.`,
      `Operador: ${LEGAL_ENTITY_NAME} — ${LEGAL_ENTITY_ID}. Última actualización: ${LEGAL_DATE}.`,
    ],
  },
];
