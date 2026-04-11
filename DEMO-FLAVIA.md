# Demo Flavia — Guion de presentación

> Guion paso a paso para mostrar todo lo construido.
> Abre la app en local (`localhost:3000`) y sigue el orden.

---

## 1. Landing page — Primera impresión

**Abrir:** `localhost:3000`

- [ ] Hero con nombre, tagline y CTA "Hablar con Flavia"
- [ ] Sección **"Puntos de entrada"** — 8 temas con icono y color propio
  - Los nuevos: Celos, Límites, Placer, Menopausia, Educación sexual
  - Cada uno lleva directo al chat con ese tema
- [ ] **NUEVO: "Explora la biblioteca"** — 6 secciones que pidió Flavia:
  - Tips educación sexual para todos
  - Te recomiendo
  - Lo más hablado
  - ¿Te ha pasado?
  - QuicKly
  - Emocional-mente
  - Cada card enlaza a la biblioteca filtrada por esa sección
- [ ] Sección de planes (Gratis / Plus)
- [ ] SEO completo: título, descripción, Open Graph para compartir en redes

**Lo que no se ve:**
- PWA instalable (se puede "instalar" como app en el móvil)
- Favicon personalizado (F en degradado rosa)
- Meta tags para WhatsApp/Instagram (imagen y descripción al compartir link)

---

## 2. Biblioteca — El corazón editorial

**Abrir:** `localhost:3000/library`

### 2a. Vista principal (sin filtros)
- [ ] Grid de **6 secciones** con iconos, colores y descripciones
- [ ] Hacer clic en **"Lo más hablado"**

### 2b. Dentro de una sección
- [ ] Barra de secciones arriba (tabs) con botón "← Secciones" para volver
- [ ] **5 artículos reales** de las columnas de Coopidrogas:
  - "Pereza sexual — ¿es normal no tener ganas?"
  - "Cuando el sexo es malo pero el amor es bueno"
  - "¿Miedo a no ser normal sexualmente?"
  - "Lo que acaba con los matrimonios no es la infidelidad"
  - "Crisis en la intimidad — cuando el cuerpo dice basta"
- [ ] Cada artículo tiene tags de tema con colores propios
- [ ] Filtros por **tema** (13 temas) y por **formato** (artículo, video, audio, guía, FAQ, script, recomendación de libro)

### 2c. Sección "Te recomiendo"
- [ ] Navegar a "Te recomiendo" desde los tabs
- [ ] **6 libros de Flavia** con reseñas reales:
  - Sexo sin Misterio, ¿Qué Hago con el Sexo?, PoliAmor, Sexo Mandamiento, Deseo, Eva Mordió la Manzana
- [ ] Cada uno marcado como content type "book_recommendation"

### 2d. Sección "Tips educación sexual"
- [ ] Videos de YouTube de Flavia embebidos
- [ ] Segmentación por audiencia preparada (hombres, mujeres, parejas, adolescentes, edad madura)

### 2e. Detalle de una pieza
- [ ] Hacer clic en cualquier item → página de detalle con imagen, tags, texto
- [ ] Badge de Premium si aplica
- [ ] Botón de favoritos (corazón) si estás logueado
- [ ] Videos de YouTube embebidos directamente

**Lo que no se ve:**
- **25 piezas de contenido** en total (14 previas + 5 columnas + 6 libros)
- 7 formatos de contenido soportados
- 6 secciones editoriales
- 6 segmentos de audiencia
- Modelo preparado para Sanity CMS (cuando quieran migrar de código a gestor de contenido)
- Fallback automático: si Sanity no tiene datos, sirve del contenido hardcoded sin que el usuario note nada

---

## 3. Chat con Flavia — La experiencia central

**Abrir:** `localhost:3000/chat`

### 3a. Primera vez (sin historial)
- [ ] 8 tarjetas de temas para elegir por dónde empezar
- [ ] Hacer clic en una tarjeta → se abre el chat con un mensaje introductorio de ese tema

### 3b. Conversación
- [ ] Escribir un mensaje → respuesta en streaming (aparece letra por letra)
- [ ] Tono de Flavia: cálido, sin juicio, directo, con humor sutil
- [ ] Probar preguntar sobre menopausia o educación sexual (temas nuevos)
- [ ] Las burbujas: usuario en degradado rosa, Flavia en blanco cálido

### 3c. Recomendaciones inteligentes
- [ ] Después de 3+ mensajes, Flavia puede recomendar contenido de la biblioteca
- [ ] Las recomendaciones se basan en el tema detectado de la conversación
- [ ] Máximo 3 por sesión, nunca dos seguidas, contenido antes que productos

**Lo que no se ve:**
- **13 temas** detectados automáticamente por IA (era 7, ahora 13)
- Detección por keywords + emociones + contexto semántico
- Temas nuevos: celos, límites, placer, menopausia, disfunción eréctil, educación sexual
- Fallback automático: si OpenAI falla → cambia a Anthropic sin que el usuario lo note
- Cada sesión se guarda completa en base de datos
- Resumen de sesión generado por IA (se puede enviar por email)
- Voice profile de Flavia: su tono, sus expresiones, sus metáforas — todo codificado para que la IA suene como ella

---

## 4. Dashboard — Espacio personal del usuario

**Abrir:** `localhost:3000/dashboard` (necesita estar logueado)

- [ ] Saludo dinámico (Buenos días/tardes/noches)
- [ ] Frase diaria de Flavia (rota cada día, 10 frases reales)
- [ ] **Progreso emocional** — mensajes motivacionales según cuántas sesiones lleva
- [ ] **"Retoma tu conversación"** — última sesión con tema, tiempo y último mensaje
- [ ] **"Para ti ahora"** — 3 piezas de la biblioteca priorizadas por:
  - El tema activo del usuario
  - Las secciones más relevantes para ese tema
- [ ] **"Tus favoritos"** — contenido marcado con corazón (sin duplicados con "Para ti")
- [ ] **Historial de conversaciones** — últimas 5 sesiones con tema y fecha
- [ ] Card de plan (Gratis / Plus activo)
- [ ] Resumen de sesión con opción de enviar por email

**Lo que no se ve:**
- La priorización de contenido usa un mapa tema→secciones (ej: si hablas de "deseo", prioriza "Tips educación sexual" y "Lo más hablado")
- Los favoritos se deduplicean automáticamente de las recomendaciones
- Todo se carga en paralelo (sesiones + biblioteca + favoritos + plan) para velocidad

---

## 5. Sistema de autenticación

**Abrir:** `localhost:3000/login`

- [ ] Login con código de 8 dígitos por email (sin contraseñas)
- [ ] Flujo: email → código → dentro
- [ ] Sesión persistente (no te pide login cada vez)

**Lo que no se ve:**
- Supabase Auth con OTP
- Middleware que refresca la sesión automáticamente en cada petición
- Rutas protegidas: chat, dashboard, cuenta, favoritos — redirigen a login si no hay sesión

---

## 6. Comunidad (feature flag activo)

**Abrir:** `localhost:3000/comunidad`

- [ ] Hilos de discusión por tema
- [ ] Comentarios anidados
- [ ] Crear hilo (solo usuarios Plus)
- [ ] Historias de usuarios (anónimas por defecto)
- [ ] Flavia puede responder con IA en hilos
- [ ] Sistema de reportes

**Lo que no se ve:**
- Moderación por IA automática (detecta contenido inapropiado antes de publicar)
- Panel de admin unificado en `/admin/moderacion`
- Feature-flagged: se puede activar/desactivar sin tocar código

---

## 7. Billing y planes

**Abrir:** `localhost:3000/plans`

- [ ] Plan Gratis vs Flavia Plus
- [ ] Checkout con Stripe
- [ ] Portal de gestión de suscripción

**Lo que no se ve:**
- Webhook de Stripe → sincroniza estado de pago con Supabase en tiempo real
- Si el pago falla, el usuario vuelve a free automáticamente

---

## 8. Panel de administración

**Abrir:** `localhost:3000/admin` (solo admins)

- [ ] Contadores: sesiones de chat, mensajes totales, piezas de biblioteca
- [ ] Top temas más hablados (con los 13 temas y colores)
- [ ] `/admin/moderacion` — moderación de threads, comentarios, historias, reportes
- [ ] `/admin/stories` — gestión de historias de usuarios

---

## 9. Infraestructura técnica (lo invisible)

Esto no se "muestra" pero es importante que Flavia sepa que existe:

- **Base de datos**: 9 tablas en Supabase (chat, favoritos, feedback, comunidad, billing)
- **Migración SQL lista** para expandir los topics en producción
- **Analytics**: PostHog integrado para entender comportamiento de usuarios
- **Email**: Resend configurado para enviar resúmenes de sesión
- **CMS**: Sanity preparado (cuando quieran que un equipo editorial gestione contenido sin tocar código)
- **SEO**: Metadata + Open Graph en todas las páginas, dinámico para items de biblioteca
- **Performance**: Carga en paralelo, streaming de chat, revalidación cada 60s del CMS
- **Seguridad**: Auth OTP, rutas protegidas, moderación de contenido, admin por email

---

## 10. Lo que queda pendiente (para ser transparentes)

| Pendiente | Qué necesitamos |
|---|---|
| **Voz clonada de Flavia** | 30 min de audio limpio de Flavia hablando (sin música, sin ruido) |
| **Sección "¿Te ha pasado?"** | Escenarios/historias escritas por Flavia |
| **Sección "QuicKly"** | Preguntas reales de audiencia (de redes sociales) |
| **Sección "Emocional-mente"** | Contenido dedicado de Flavia sobre emociones |
| **Contenido para adolescentes** | Material segmentado para esa audiencia |
| **Más libros/películas** | Para enriquecer "Te recomiendo" |
| **Versión en inglés** | Ejecutar el plan de localización en [docs/english-localization-plan.md](docs/english-localization-plan.md) |
| **Dominio y deploy final** | flavia.app configurado en Vercel |

---

## Números clave

| Métrica | Valor |
|---|---|
| Temas del chat | 13 |
| Piezas en la biblioteca | 25 |
| Secciones editoriales | 6 |
| Formatos de contenido | 7 |
| Segmentos de audiencia | 6 |
| Tarjetas de entrada al chat | 8 |
| Tablas en base de datos | 9+ |
| Páginas / rutas | 20+ |
