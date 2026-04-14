# FlavIA — Todo lo que hay construido

> Lista completa para la reunión con Flavia. Organizado por bloques.
> Lo marcado con 🔍 son cosas que no se ven a primera vista pero hay que mencionar.
> Lo marcado con ❓ son puntos a revisar/decidir con ella.

---

## A. El chat — Experiencia central

### Lo que se ve
- Chat con streaming (respuesta aparece letra a letra, se siente natural)
- 8 tarjetas de entrada por tema al empezar (Deseo, Pareja, Comunicación, Celos, Límites, Placer, Menopausia, Educación sexual)
- Burbujas diferenciadas: usuario en degradado rosa, Flavia en blanco cálido
- Indicador de mensajes restantes (plan gratis)
- Paywall elegante cuando se acaban los mensajes → CTA a Plus
- Recomendaciones inline: aparecen cards de contenido/productos dentro de la conversación
- Resumen de sesión generado por IA con botón "Enviar por email"

### Lo que no se ve (🔍)
- 🔍 **13 temas detectados automáticamente** por IA (antes eran 7, ahora incluyen celos, límites, placer, menopausia, disfunción eréctil, educación sexual)
- 🔍 Detección por 3 capas: keywords, emociones, contexto semántico (LLM)
- 🔍 **Voice profile completo de Flavia** codificado: tono, frases signature, marcos terapéuticos (ideal/real/posible, deseo-como-músculo, seres-faltantes), vocabulario que usa y que evita, estructura de respuesta (validar → enfocar → microavance)
- 🔍 **Frases reales de Flavia** extraídas de transcripts, columnas y audios de WhatsApp integradas en el prompt
- 🔍 Guía específica por cada uno de los 13 temas (cómo Flavia aborda menopausia vs celos vs placer)
- 🔍 Boundaries firmes: nunca diagnostica, nunca juzga, nunca usa emojis, sugiere profesional en casos serios
- 🔍 Fallback automático: si OpenAI falla → cambia a Anthropic sin que el usuario note nada
- 🔍 Recomendaciones inteligentes: mínimo 3 turnos, contenido antes que productos, máx 3/sesión, nunca dos seguidas
- 🔍 Cada sesión + cada mensaje se guarda completo en base de datos
- 🔍 Sistema de contexto: el chat sabe el tema activo y el estado emocional del usuario

### A revisar con Flavia (❓)
- ❓ ¿El tono suena a ella? Hacer prueba en vivo con 3-4 conversaciones de temas diferentes
- ❓ ¿Faltan temas? (los 13 actuales cubren bien su trabajo?)
- ❓ ¿Las frases signature son correctas o hay que ajustar alguna?
- ❓ ¿Hay marcos terapéuticos suyos que faltan en el voice profile?
- ❓ ¿El límite de 5 mensajes gratis es correcto o demasiado poco/mucho?

---

## B. La biblioteca — Contenido editorial

### Lo que se ve
- Página principal con **6 secciones** (las que pidió Flavia):
  - 💡 Tips educación sexual para todos
  - 📖 Te recomiendo
  - 🔥 Lo más hablado
  - 🤔 ¿Te ha pasado?
  - ⚡ QuicKly
  - 💜 Emocional-mente
- Navegación por secciones con tabs
- Filtros por tema (13) y por formato (7 tipos)
- **25 piezas de contenido** en total:
  - 10 videos de YouTube de Flavia embebidos
  - 5 artículos de sus columnas reales en Coopidrogas
  - 6 recomendaciones de sus libros con reseñas
  - 4 guías/FAQ
- Página de detalle para cada pieza: imagen, texto, video embebido, tags de tema
- Botón de favoritos (corazón) en cada pieza
- Badge "Plus" en contenido premium
- CTA "Hablar con Flavia sobre esto" → abre chat con el tema

### Lo que no se ve (🔍)
- 🔍 7 formatos de contenido soportados: artículo, audio, guía, FAQ, script, video, recomendación de libro
- 🔍 6 segmentos de audiencia preparados: hombres, mujeres, parejas, adolescentes, edad madura, todos
- 🔍 Sistema de tags: cada pieza tiene tags de tema, de sección, y de audiencia
- 🔍 Sanity CMS conectado como backend editorial (cuando quieran que alguien no-técnico gestione contenido)
- 🔍 Fallback automático: si Sanity no tiene datos → sirve contenido hardcoded sin que nadie lo note
- 🔍 SEO por pieza: cada item tiene su propia metadata + Open Graph (imagen y texto al compartir en redes)
- 🔍 Productos de Lelo integrados como recomendaciones (imágenes permitidas desde assets.lelo.com)

### A revisar con Flavia (❓)
- ❓ ¿Los títulos y descripciones de las 6 secciones están bien?
- ❓ ¿Qué contenido va en "¿Te ha pasado?" — escenarios/historias escritas por ella?
- ❓ ¿Qué contenido va en "QuicKly" — preguntas reales de su audiencia en redes?
- ❓ ¿Qué contenido va en "Emocional-mente" — reflexiones sobre emociones?
- ❓ ¿Más libros o películas para "Te recomiendo"?
- ❓ ¿Hay contenido específico para adolescentes?
- ❓ ¿Los 5 artículos de Coopidrogas están bien resumidos?

---

## C. Dashboard — Espacio personal

### Lo que se ve
- Saludo dinámico (Buenos días/tardes/noches)
- Frase diaria de Flavia (rota cada día, 10 frases reales)
- Progreso emocional: mensajes motivacionales según cuántas sesiones lleva el usuario
- "Retoma tu conversación" — última sesión con tema, tiempo, último mensaje
- "Para ti ahora" — 3 piezas de la biblioteca personalizadas
- "Tus favoritos" — contenido marcado con corazón
- Historial de conversaciones — últimas 5 sesiones
- Card de plan (Gratis / Plus con badges)
- Resumen de sesión con opción de enviar por email
- Empty state para nuevos usuarios: CTA + tarjetas de temas

### Lo que no se ve (🔍)
- 🔍 La sección "Para ti" prioriza por tema activo + sección relevante (ej: si hablas de deseo → prioriza "Tips educación sexual" y "Lo más hablado")
- 🔍 Mapa de 13 temas → secciones prioritarias (cada tema tiene 2 secciones preferentes)
- 🔍 Favoritos se deduplicean de las recomendaciones (nunca ves el mismo item dos veces)
- 🔍 Todo se carga en paralelo (5 queries simultáneas) para velocidad

### A revisar con Flavia (❓)
- ❓ ¿Las 10 frases diarias son buenas o tiene mejores?
- ❓ ¿Los mensajes de progreso emocional suenan bien?

---

## D. Comunidad (feature flag)

### Lo que se ve
- Hilos de discusión organizados por tema
- Dos tabs: "Conversaciones" y "Historias"
- Comentarios anidados (respuestas a respuestas)
- Botón "Invitar a Flavia" — la IA responde como Flavia en un hilo (solo Plus)
- Historias de usuarios (anónimas por defecto)
- Botón de reportar contenido
- Crear hilo: solo usuarios Plus

### Lo que no se ve (🔍)
- 🔍 Moderación automática por IA antes de publicar
- 🔍 Panel de admin unificado para moderar todo (hilos, comentarios, historias, reportes)
- 🔍 Rate limiting: free users → 3 respuestas/día, 1 historia/semana
- 🔍 Se puede activar/desactivar toda la comunidad con un feature flag sin tocar código
- 🔍 Las respuestas de "Flavia" en comunidad usan el mismo voice profile que el chat

### A revisar con Flavia (❓)
- ❓ ¿Se activa la comunidad desde el inicio o se espera a tener usuarios?
- ❓ ¿Solo Plus puede crear hilos, o también free?

---

## E. Landing page

### Lo que se ve
- Hero con foto de Flavia, nombre, tagline y CTA
- Demo visual del chat
- 8 temas como puntos de entrada (con links al chat)
- **Nuevo: 6 secciones de la biblioteca** como cards de descubrimiento
- Sección "Cómo funciona"
- Value props
- Sección de planes
- Footer

### A revisar con Flavia (❓)
- ❓ ¿El tagline/copy del hero está bien?
- ❓ ¿Qué fotos quiere usar? (hay 5 fotos suyas cargadas)

---

## F. Auth y cuenta

- Login sin contraseña: email → código de 8 dígitos → dentro
- Página de cuenta: plan activo, fecha de renovación, gestionar suscripción
- Historial de recomendaciones clickeadas
- Logout

### Lo que no se ve (🔍)
- 🔍 Supabase Auth con OTP (más seguro que contraseñas)
- 🔍 Sesión persistente con refresh automático en cada petición
- 🔍 Redirect inteligente: si intentas entrar a /chat sin login → login → vuelves a /chat

---

## G. Billing

### Lo que se ve
- Página de planes: Gratis vs Flavia Plus
- Checkout con Stripe (tarjeta)
- Portal de gestión de suscripción (cambiar tarjeta, cancelar)
- Banner post-checkout (éxito/cancelado)

### Lo que no se ve (🔍)
- 🔍 Webhook de Stripe sincroniza estado en tiempo real
- 🔍 Si falla el pago → vuelve a free automáticamente
- 🔍 Eventos monitorizados: checkout started, completed, paywall hit

---

## H. Admin

### Lo que se ve
- Dashboard de métricas: usuarios Plus, tasa de conversión, cancelaciones
- Uso: usuarios totales, sesiones, mensajes (hoy/semana)
- Gráfico sparkline de mensajes últimos 30 días
- Top temas más hablados (barra, 13 temas con colores)
- Tabla de usuarios recientes (emails enmascarados)
- Sesiones recientes
- Moderación de comunidad: pending/reported/actioned
- Gestión de historias: aprobar/rechazar
- Link directo a Stripe Dashboard

---

## I. Infraestructura y cosas técnicas

No se "muestran", pero vale la pena mencionarlas como inversión de producto:

- 🔍 **PWA**: Instalable como app en móvil (icono, splash screen, modo standalone)
- 🔍 **SEO completo**: Metadata + Open Graph en todas las páginas, dinámico para items de biblioteca
- 🔍 **Analytics**: PostHog tracking 10+ eventos (home viewed, chat opened, first message, paywall hit, checkout, recomendaciones...)
- 🔍 **Email**: Resend configurado, plantilla HTML branded para resúmenes de sesión
- 🔍 **i18n**: Español + inglés con next-intl, locale switcher, 9 archivos de traducción por idioma
- 🔍 **Performance**: Streaming, carga en paralelo, revalidación cada 60s del CMS
- 🔍 **Base de datos**: 10+ tablas en Supabase (perfiles, sesiones, mensajes, suscripciones, favoritos, feedback, comunidad...)
- 🔍 **Migración SQL lista** para expandir topics en producción
- 🔍 **Tipado completo**: TypeScript estricto en todo el proyecto, Zod para validación de datos

---

## J. Números clave

| Qué | Cuánto |
|---|---|
| Temas del chat | 13 |
| Piezas en la biblioteca | 25 |
| Secciones editoriales | 6 |
| Formatos de contenido | 7 |
| Segmentos de audiencia | 6 |
| Tarjetas de entrada al chat | 8 |
| Tablas en base de datos | 10+ |
| Páginas / rutas | 20+ |
| Endpoints API | 14 |
| Eventos de analytics | 10+ |
| Idiomas | 2 (ES + EN) |

---

## K. Lo que falta (ser transparentes)

| Pendiente | Qué necesitamos de Flavia |
|---|---|
| **Voz clonada** | 30 min de audio limpio hablando (sin música, sin ruido, habitación silenciosa) |
| **Contenido "¿Te ha pasado?"** | Escenarios/historias escritas por ella |
| **Contenido "QuicKly"** | Preguntas reales de su audiencia (Instagram, YouTube, etc.) |
| **Contenido "Emocional-mente"** | Reflexiones/contenido sobre emociones |
| **Más para "Te recomiendo"** | Más libros, películas, podcasts que recomiende |
| **Material para adolescentes** | Contenido segmentado para esa audiencia |
| **Versión en inglés** | Ejecutar el plan de localización en [docs/english-localization-plan.md](docs/english-localization-plan.md) |
| **Revisión del voice profile** | Sesión de prueba del chat + feedback sobre tono/frases |
| **Fotos y branding** | Confirmar qué fotos usar, revisar colores y estilo |
| **Dominio y deploy** | flavia.app configurado en Vercel |
| **Contenido de Sanity** | Decidir cuándo migrar de contenido hardcoded a CMS |
