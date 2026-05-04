// ===========================================================================
// POLÍTICA DE PRIVACIDAD — FlavIA
// Marco legal: Ley 1581 de 2012 (Habeas Data) + Decreto 1377 de 2013 (Colombia)
// Plantilla editable. Revisar con abogado antes del lanzamiento comercial.
// ===========================================================================

import type { LegalSection } from "./terms";
export type { LegalSection };
export {
  LEGAL_ENTITY_NAME,
  LEGAL_ENTITY_ID,
  LEGAL_EMAIL,
  LEGAL_DATE,
  LEGAL_JURISDICTION,
  APP_NAME,
  APP_URL,
} from "./terms";

import {
  LEGAL_ENTITY_NAME,
  LEGAL_ENTITY_ID,
  LEGAL_EMAIL,
  LEGAL_DATE,
  APP_NAME,
  APP_URL,
} from "./terms";

export const privacySections: LegalSection[] = [
  {
    id: "responsable",
    title: "1. Responsable del tratamiento",
    content: [
      `El responsable del tratamiento de sus datos personales es ${LEGAL_ENTITY_NAME} (${LEGAL_ENTITY_ID}), en adelante "el Responsable", propietario y operador de la plataforma ${APP_NAME} accesible en ${APP_URL}.`,
      `Para ejercer sus derechos o resolver dudas sobre esta política, puede contactarnos en: ${LEGAL_EMAIL}.`,
    ],
  },
  {
    id: "datos_recopilados",
    title: "2. Datos personales que recopilamos",
    content: [
      `Recopilamos únicamente los datos necesarios para prestar el servicio:`,
      `(a) Datos de registro: correo electrónico.`,
      `(b) Datos de uso: conversaciones con el asistente de IA, historial de sesiones, preferencias configuradas y favoritos guardados.`,
      `(c) Datos de pago: gestionados exclusivamente por Stripe (procesador de pagos certificado PCI-DSS). El Responsable no almacena datos de tarjetas de crédito o débito.`,
      `(d) Datos técnicos: dirección IP, tipo de navegador, sistema operativo y páginas visitadas, recopilados automáticamente para garantizar el funcionamiento y seguridad del servicio.`,
      `(e) Contenido generado: publicaciones en la comunidad y valoraciones que el usuario decide compartir voluntariamente.`,
    ],
  },
  {
    id: "datos_sensibles",
    title: "3. Datos sensibles — Tratamiento especial",
    content: [
      `Las conversaciones con el asistente de IA pueden contener información de naturaleza sensible relativa a la salud sexual, emocional o relacional del usuario. Conforme a la Ley 1581 de 2012, estos datos reciben tratamiento especialmente protegido.`,
      `El contenido de las conversaciones se utiliza únicamente para: (a) proporcionar las respuestas del asistente en tiempo real; (b) generar resúmenes de sesión a solicitud del usuario; (c) mejorar los modelos de IA de forma anonimizada y agregada.`,
      `El Responsable no venderá, cederá ni utilizará el contenido de las conversaciones para publicidad personalizada de terceros.`,
    ],
  },
  {
    id: "finalidades",
    title: "4. Finalidades del tratamiento",
    content: [
      `Sus datos personales se tratan para las siguientes finalidades:`,
      `(a) Prestar y personalizar el servicio de ${APP_NAME}.`,
      `(b) Gestionar su cuenta, autenticación y preferencias.`,
      `(c) Procesar pagos y gestionar su suscripción.`,
      `(d) Enviar comunicaciones transaccionales: confirmaciones de pago, recuperación de contraseña, notificaciones de cuenta.`,
      `(e) Enviar comunicaciones de marketing (boletín), únicamente con su consentimiento explícito y con opción de baja en cada comunicación.`,
      `(f) Cumplir con obligaciones legales y responder a requerimientos de autoridades competentes.`,
      `(g) Mejorar el servicio mediante análisis estadísticos anónimos.`,
    ],
  },
  {
    id: "base_legal",
    title: "5. Base legal del tratamiento",
    content: [
      `El tratamiento de sus datos se fundamenta en: (a) su consentimiento libre e informado otorgado al registrarse y aceptar esta Política; (b) la ejecución del contrato de prestación de servicios; (c) el cumplimiento de obligaciones legales aplicables en Colombia.`,
      `Puede retirar su consentimiento en cualquier momento, lo que puede implicar la imposibilidad de continuar prestando el servicio.`,
    ],
  },
  {
    id: "proveedores",
    title: "6. Proveedores de servicios (encargados del tratamiento)",
    content: [
      `Para prestar el servicio utilizamos los siguientes proveedores que actúan como encargados del tratamiento:`,
      `(a) Supabase — base de datos e infraestructura (servidores en AWS us-east-1 y eu-west-1).`,
      `(b) OpenAI / Anthropic — procesamiento de lenguaje natural para el asistente de IA.`,
      `(c) Stripe — procesamiento de pagos.`,
      `(d) Resend — envío de correos transaccionales.`,
      `(e) PostHog — analítica de uso, configurado en modo sin cookies y con anonimización de IPs.`,
      `Todos los proveedores están sujetos a acuerdos de tratamiento de datos y operan bajo estándares de seguridad reconocidos internacionalmente.`,
    ],
  },
  {
    id: "transferencias",
    title: "7. Transferencias internacionales",
    content: [
      `Algunos de nuestros proveedores procesan datos en servidores ubicados en Estados Unidos y otros países. Estas transferencias se realizan bajo cláusulas contractuales estándar o mecanismos equivalentes que garantizan un nivel de protección adecuado.`,
      `El Responsable no realizará transferencias internacionales de datos a terceros sin garantías suficientes de protección, conforme a lo exigido por la Ley 1581 de 2012.`,
    ],
  },
  {
    id: "conservacion",
    title: "8. Plazo de conservación",
    content: [
      `Conservamos sus datos mientras su cuenta esté activa y durante el tiempo necesario para cumplir con las finalidades descritas. Al eliminar su cuenta, procederemos a eliminar o anonimizar sus datos personales en un plazo máximo de 30 días, salvo que la conservación sea necesaria por obligación legal.`,
      `Los registros de transacciones de pago se conservan durante el plazo exigido por la normativa tributaria colombiana (generalmente 5 años).`,
    ],
  },
  {
    id: "derechos",
    title: "9. Sus derechos (Habeas Data)",
    content: [
      `Conforme a la Ley Estatutaria 1581 de 2012, usted tiene derecho a:`,
      `(a) Conocer, actualizar y rectificar sus datos personales.`,
      `(b) Ser informado sobre el uso que se da a sus datos.`,
      `(c) Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).`,
      `(d) Revocar la autorización de tratamiento y/o solicitar la supresión de sus datos, salvo que exista obligación legal de conservarlos.`,
      `(e) Acceder gratuitamente a sus datos personales.`,
      `Para ejercer cualquiera de estos derechos, envíe su solicitud a ${LEGAL_EMAIL}. Responderemos en el plazo legal (10 días hábiles para consultas, 15 días hábiles para reclamos).`,
    ],
  },
  {
    id: "seguridad",
    title: "10. Medidas de seguridad",
    content: [
      `Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos contra el acceso no autorizado, la pérdida o la divulgación, incluyendo: cifrado en tránsito (TLS/HTTPS), cifrado en reposo, control de acceso basado en roles y revisiones periódicas de seguridad.`,
      `En caso de una violación de datos que afecte sus derechos, le notificaremos conforme a los plazos y procedimientos establecidos por la normativa colombiana.`,
    ],
  },
  {
    id: "cookies",
    title: "11. Cookies y tecnologías similares",
    content: [
      `Utilizamos cookies de sesión estrictamente necesarias para la autenticación. Para analítica utilizamos PostHog en modo sin cookies (fingerprinting anónimo).`,
      `No utilizamos cookies de seguimiento de terceros ni publicidad comportamental. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del servicio.`,
    ],
  },
  {
    id: "menores",
    title: "12. Menores de edad",
    content: [
      `El servicio está dirigido exclusivamente a personas mayores de 18 años. No recopilamos conscientemente datos de menores. Si detectamos que un menor ha proporcionado datos, los eliminaremos de inmediato.`,
    ],
  },
  {
    id: "modificaciones",
    title: "13. Cambios en esta Política",
    content: [
      `Podemos actualizar esta Política periódicamente. Los cambios significativos se notificarán por correo electrónico o mediante aviso en la plataforma. La fecha de "Última actualización" al final del documento indica cuándo se realizó la última revisión.`,
    ],
  },
  {
    id: "contacto",
    title: "14. Contacto y reclamaciones",
    content: [
      `Para cualquier consulta o ejercicio de derechos: ${LEGAL_EMAIL}.`,
      `Si considera que su solicitud no ha sido atendida satisfactoriamente, puede presentar una queja ante la Superintendencia de Industria y Comercio de Colombia (www.sic.gov.co).`,
      `Responsable: ${LEGAL_ENTITY_NAME} — ${LEGAL_ENTITY_ID}. Última actualización: ${LEGAL_DATE}.`,
    ],
  },
];
