# Reglas operativas y estándares de ingeniería

## Flujo definitivo de despliegue (Cloudflare Pages)
En todos los proyectos, el flujo definitivo de despliegue en Cloudflare es:
1. Compilar el código: `npm run build`
2. Documentar los cambios en el `README.md`
3. Hacer commit y push de los cambios
4. Ejecutar directamente: `npx wrangler pages deploy dist`

Evita siempre ejecutar comandos de pruebas unitarias o linting automáticos durante el despliegue para prevenir bloqueos del sistema.

## Tono y estilo: cero emojis
Bajo ninguna circunstancia debes incluir emojis en los textos generados o sugeridos para este proyecto (interfaces de usuario, mensajes, notificaciones, tooltips, alertas, reportes o logs). Todo el contenido escrito debe mantener un tono estrictamente profesional, limpio y directo.

## Límite estricto de 300 líneas y modularización temprana
Ningún archivo de código dentro del directorio `src/` debe exceder las 300 líneas.
- **Descomposición inmediata**: Si un componente, vista o módulo se aproxima o supera este límite, es estrictamente obligatorio descomponerlo en subcomponentes modulares dentro de subdirectorios, extraer lógica de estado a hooks personalizados (`hooks/`) y mover utilidades a `lib/`.
- **Auditoría automatizada**: Ejecuta periódicamente `npm run audit:lines` (`node scripts/check-file-lines.js`) para verificar que todos los archivos cumplan esta restricción.

## Verificación estricta de importaciones y declaraciones (zero "is not defined")
Antes de dar por finalizada cualquier edición o reemplazo de código en cualquier archivo (`.tsx`, `.ts`, `.jsx`, `.js`), es estrictamente obligatorio:
1. **Auditar importaciones en la cabecera**: Verificar que todo hook de React (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`), componente de UI, icono de Lucide o utilidad (`cn`, etc.) esté debidamente declarado e importado en la parte superior.
2. **Cero variables fantasma**: Asegurar que ninguna variable, prop o función referenciada quede sin inicializar o fuera de su ámbito léxico.

## Regla de escritura: tipo oración (sentence case) y puntuación
Todo el texto visible al usuario final — incluyendo títulos SEO, etiquetas de botones, labels de UI, textos de menú, mensajes de toast, placeholders, headings y cualquier otro string de la interfaz — DEBE estar en **tipo oración**: solo la primera letra de la primera palabra en mayúscula. Las únicas excepciones son:
- **Nombres propios**: República Dominicana, Santo Domingo, Santiago, etc.
- **Nombres de marca o producto**: Amigable.do, WhatsApp, Google, Supabase, Cloudflare, etc.
- **Siglas y acrónimos**: RD$, NCF, RNC, CRO, SEO, API, UI, URL, etc.
- **La primera palabra de un título o frase** (siempre en mayúscula).

### Prohibición de puntos suspensivos
- **No utilizar puntos suspensivos (`...`)** al final de las oraciones, títulos, estados de carga o mensajes de interfaz.

Ejemplos correctos:
- "Guardar cambios"
- "Catálogo de productos y servicios"
- "Iniciar sesión en tu cuenta"
- "Cargando información"

Ejemplos incorrectos:
- "Guardar Cambios"
- "Catálogo De Productos Y Servicios"
- "Cargando información..."

## Gestión de ramas y pull requests
Una vez incorporadas (mergeadas) o descartadas, las ramas asociadas a las Pull Requests deben ser eliminadas inmediatamente desde el repositorio remoto para mantener el control de versiones limpio y organizado.

## Riesgos de seguridad aceptados (no modificar)
1. **CORS permisivo en Edge Functions (Access-Control-Allow-Origin: *)**: Requerido para integraciones B2B y extensiones. Mitigado por autenticación JWT / API Keys.
2. **Sub Resource Integrity (SRI) omitido en chunks locales**: Los chunks estáticos residen en Cloudflare Pages en el mismo origen.
3. **CSP style-src 'unsafe-inline'**: Necesario para Google Tag Manager y utilidades de estilos en tiempo de ejecución.
4. **Ausencia de Anti-CSRF Tokens basada en cookies**: La API se autentica mediante cabecera Bearer JWT (`Authorization: Bearer <token>`), no usando cookies implícitas de sesión.

## Concesión explícita de permisos (GRANT) en Supabase (desde 30 de octubre)
A partir del 30 de octubre, Supabase no expone de manera automática las nuevas tablas del esquema `public` a la Data API (PostgREST y GraphQL). Toda nueva migración o script que cree una tabla en el esquema `public` debe incluir explícitamente las sentencias `GRANT` requeridas para los roles correspondientes (`anon`, `authenticated`, `service_role`).

### Estándar de permisos según el caso de uso:

1. **Tablas con acceso público (lectura anónima y gestión autenticada):**
```sql
grant select on public.nombre_tabla to anon;
grant select, insert, update, delete on public.nombre_tabla to authenticated;
grant select, insert, update, delete on public.nombre_tabla to service_role;
```

2. **Tablas privadas (únicamente para usuarios autenticados):**
```sql
grant select, insert, update, delete on public.nombre_tabla to authenticated;
grant select, insert, update, delete on public.nombre_tabla to service_role;
```

3. **Tablas internas o de sistema (solo accesibles por Edge Functions o Service Role):**
```sql
grant select, insert, update, delete on public.nombre_tabla to service_role;
```

Nota: La sentencia `GRANT` autoriza la visibilidad y alcance en la Data API; la seguridad y filtrado fila por fila debe gestionarse siempre mediante políticas de seguridad por fila (RLS).

## Seguridad HTTP y archivo security.txt por defecto
En todo proyecto alojado en Cloudflare Pages, es estrictamente obligatorio establecer desde el inicio:
1. **Cabeceras HTTP en `public/_headers`**:
   - `Content-Security-Policy`: con directivas completas (`default-src 'self'`, `script-src 'self' 'unsafe-inline'`, `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`, `font-src 'self' https://fonts.gstatic.com data:`, `img-src 'self' data: blob: https:`, `connect-src 'self' https://*.supabase.co wss://*.supabase.co`, `frame-ancestors 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests;`).
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=*, geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=()`
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Resource-Policy: same-origin`
   - `Cross-Origin-Embedder-Policy: credentialless` (asegura compatibilidad con Google Fonts y recursos externos).
   - Inmutabilidad en `/assets/*`: `Cache-Control: public, max-age=31536000, immutable`.
2. **Archivo de divulgación de seguridad**: crear siempre `public/.well-known/security.txt` según la norma RFC 9116 con canales de contacto válidos y fecha de expiración.
3. **Alojamiento local de recursos**: jamás enlazar texturas, mapas, fotos o logos directamente desde CDNs o dominios de terceros (ej. `googleusercontent.com`). Todos los recursos multimedia deben descargarse y servirse localmente desde `/assets/` para prevenir bloqueos de CORS y CORP.

## Identidad de marca por defecto: WhatsApp y favicons
Al iniciar cualquier proyecto o recibir los detalles de marca (logotipo, isotipo, paleta de colores, nombre y propósito):
1. **Tarjeta de WhatsApp y redes sociales (Open Graph)**:
   - Crear de inmediato la imagen de previsualización en `public/assets/branding/og-preview.png` en resolución exacta de 1200 x 630 px (proporción 1.91:1).
   - Diseñar la imagen con fondo sólido limpio de alto contraste, garantizando legibilidad óptima tanto en modo oscuro como en modo claro en WhatsApp, Telegram, Facebook, LinkedIn y Twitter.
2. **Paquete completo de favicons**:
   - Generar y ubicar en `public/` los 4 formatos estándar: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png` y `apple-touch-icon.png` (180 x 180 px).
   - Ubicar el isotipo sobre una tarjeta o base redondeada de alto contraste para que sea perfectamente visible en pestañas de navegador tanto oscuras como claras.
3. **Metadatos en `index.html`**:
   - Declarar siempre de forma obligatoria las etiquetas Open Graph y Twitter con URLs absolutas hacia el dominio de producción (`og:image`, `og:image:secure_url`, `og:image:width`, `og:image:height`, `og:image:type`, `og:site_name`, `twitter:card`, `twitter:image`).
   - Declarar los enlaces a los favicons con sus tamaños correspondientes en el `<head>`.
Esta configuración debe establecerse de manera autónoma y por defecto desde el primer momento, sin necesidad de que el usuario lo solicite.

