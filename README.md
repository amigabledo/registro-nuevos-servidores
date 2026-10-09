# Registro de nuevos servidores

Plataforma web de registro y gestión de postulantes para nuevos servidores de la iglesia. Permite el autorregistro público mediante escaneo de código QR o enlace directo, y cuenta con un panel administrativo con roles jerárquicos (administradores y servidores) para seguimiento de discipulado, métricas y gestión de postulantes.

---

## 1. Características principales

- **Formulario público de autorregistro**:
  - Datos de contacto: nombre, apellido, teléfono y correo electrónico.
  - Trayectoria de discipulado:
    - ¿Realizó la escuela de nuevos creyentes? (Sí, No, Cursando).
    - ¿Bautizado en aguas? (Sí o No, con fecha aproximada condicional).
    - ¿Fue al retiro de liberación? (Sí o No, con fecha condicional).
    - ¿Tiene mentor actualmente? (Sí o No, con nombre del mentor condicional).
    - ¿Asiste a una casa de paz? (Sí o No).
  - Área ministerial deseada:
    - Ujieres.
    - Seguridad.
    - Escuela dominical.
  - Pantalla de confirmación amigable con animación de celebración y opción de registrar a otra persona.
- **Acceso seguro y roles de usuario**:
  - Interfaz de inicio de sesión inspirada en la plataforma institucional con soporte para recordar credenciales.
  - Administradores iniciales: Marcos y Katherine Ramos (kramos).
  - Servidores operativos: servidor1 y servidor2.
  - Soporte para nombres de usuario directos sin necesidad de escribir el dominio de correo.
- **Panel de control y gestión de datos**:
  - Métricas en tiempo real: conteo global de postulantes, desglose por área ministerial y porcentajes de avance en discipulado (bautismo, retiro, escuela y casa de paz).
  - Tabla interactiva con búsqueda en tiempo real por nombre, teléfono, correo o mentor.
  - Filtros rápidos por área ministerial y por estado de postulación (pendiente, en revisión, contactado, aprobado).
  - Ficha detallada de postulante con cambio de estado, notas internas y enlace directo a WhatsApp.
  - Exportación de la información a formato CSV.
  - Registro asistido desde el panel para ingresar personas presencialmente durante cultos o reuniones.
- **Módulo de código QR**:
  - Generación dinámica del código QR hacia `https://registro-nuevos-servidores.pages.dev/`.
  - Descarga directa en formato PNG en alta resolución.
  - Modo proyector en pantalla completa para proyectores y pantallas del templo.
- **Seguridad y Cloudflare Pages**:
  - Cabeceras de seguridad Grado A+ en `public/_headers` (CSP, HSTS, X-Frame-Options, Permissions-Policy).
  - Archivo de divulgación de seguridad `public/.well-known/security.txt` según RFC 9116.
  - Configuración de SEO y accesibilidad en `public/robots.txt` y `public/sitemap.xml`.
  - Cumplimiento de la restricción estricta de menos de 300 líneas por archivo de código (`npm run audit:lines`).

---

## 2. Configuración de base de datos en Supabase

1. Crear un proyecto en la consola de [Supabase](https://supabase.com).
2. En el editor SQL de Supabase, ejecutar la migración ubicada en:
   - `supabase/migrations/20261001000000_registro_servidores_schema.sql`
3. Crear los usuarios administradores y servidores en la sección de autenticación de Supabase (o ejecutar la guía de `supabase/seed_usuarios.sql`).
4. Configurar las variables en el archivo `.env`:
   ```bash
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

*Nota: La plataforma incluye persistencia reactiva en almacenamiento local con datos iniciales para pruebas y demostraciones inmediatas.*

---

## 3. Flujo de despliegue en Cloudflare Pages

El flujo definitivo de despliegue para este proyecto es:

1. Compilar el código:
   ```bash
   npm run build
   ```
2. Documentar los cambios en este `README.md`.
3. Confirmar los cambios en Git:
   ```bash
   git add .
   git commit -m "feat: implementacion inicial del sistema de registro de servidores"
   git push origin main
   ```
4. Desplegar en Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist --project-name=registro-nuevos-servidores --branch=main
   ```

---

## 4. Historial reciente de actualizaciones

- **09/10/2026**:
  - Remediación de seguridad integral: eliminación de credenciales en texto claro y bypass de demostración en `AuthContext.tsx`.
  - Integración obligatoria con Supabase Auth (`signInWithPassword`) para generación de sesiones JWT válidas.
  - Blindaje de políticas RLS en `servidores_registro`: revocación de lectura y actualización anónima; restricción de eliminación exclusivamente al rol de administrador.
  - Eliminación de cadenas de conexión estáticas a PostgreSQL en scripts administrativos (`create_presentaciones_table.cjs`), requiriendo variables de entorno protegidas.
- **06/10/2026**:
  - Reemplazo de la exportación CSV por opciones directas de exportación en Excel (.xlsx) y en formato PDF (.pdf).
  - Eliminación del selector de filtro por estado y sustitución por filtro por mentor ("Todos los mentores", "Sin mentor", "Con mentor") para filtrar inmediatamente a postulantes sin mentor.
  - Filtro optimizado por ministerio escogido ("Todos los ministerios", "Ujieres", "Seguridad", "Escuela dominical").
  - Visualización del mentor asignado o etiqueta "Sin mentor" directamente en la tabla principal de registros.
  - Actualización del código de Google Apps Script (`scripts/sheets-servidores.js`) incorporando la función de reparación y sincronización autónoma desde la base de datos de Supabase para corregir columnas desalineadas y campos vacíos.
- **05/10/2026**:
  - Corrección de alineación del banner institucional de tres filas en Google Sheets a la izquierda, garantizando que los títulos sean 100% visibles inmediatamente al abrir la hoja en cualquier pantalla o resolución sin requerir desplazamiento horizontal.
  - Formato corporativo para exportación a Excel (.xlsx) con alturas de fila generosas (40 px, 36 px, 32 px para el membrete, 44 px para encabezados y 28 px para filas de datos) y tipografía Calibri tamaño 12.
  - Integración con Google Sheets mediante Google Apps Script para Inscripción de Servidores (`scripts/sheets-servidores.js`), Presentación de Niños (`scripts/sheets-presentacion-ninos.js`) y Hospedaje Revival (`scripts/sheets-hospedaje-revival.js`).
  - Implementación de Cloudflare Pages Functions en `functions/api/` (`servidores.ts`, `presentacion.ts`, `hospedaje.ts`, `sync.ts`) para despacho a variables de entorno de webhooks.
  - Sincronización histórica exitosa de registros de servidores hacia Google Sheets con fecha oficial de República Dominicana y formato tabular.
  - Generación de sincronizador por lotes (`scripts/sync-all-to-sheets.cjs`) para transferir respuestas históricas de cualquiera de los 3 formularios mediante comandos directos.
- **04/10/2026**:
  - Eliminación de la obligatoriedad del correo electrónico en el formulario de inscripción, pasando a ser un campo opcional.
  - Eliminación de la obligatoriedad de la fecha de bautismo para postulantes bautizados en aguas.
  - Eliminación de la obligatoriedad de la fecha de retiro de liberación.
  - Inclusión de casilla de notas y comentarios adicionales al final del formulario de postulación, integrada a la base de datos y a la exportación CSV.
- **03/10/2026**:
  - Remoción del pie de página con información institucional en la página de inicio pública.
  - Actualización del nombre a "Ministerio Internacional Monte de Dios" en la pantalla de inicio de sesión y en la cabecera del panel administrativo.
  - Remoción de la visualización de correos electrónicos en la ficha de detalle de postulantes, tabla de registros y cuentas del equipo.
    - Remoción del acceso sin autenticación en sincronía con los estándares de seguridad de la organización.
- **Identidad de marca y cabecera institucional**:
  - Integración visual destacada del nombre oficial **Monte de Dios** en la cabecera superior y en el inicio de sesión.
  - Subtítulo formal "Nuevos servidores" manteniendo equilibrio estético y legibilidad tanto en móviles como en computadoras.
- **Tarjeta Open Graph y WhatsApp**:
  - Generación de la tarjeta oficial de previsualización en `public/assets/branding/og-preview.png` en resolución exacta de 1200 x 630 px con fondo de alto contraste, isotipo en tarjeta redondeada y tipografía clara para enlaces compartidos en WhatsApp y redes sociales.
- **Acceso seguro de cuentas**:
  - Cuentas gestionadas a través de Supabase Auth con credenciales cifradas y roles en `public.profiles`.
