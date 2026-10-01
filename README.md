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
  - Administradores iniciales: Marcos y cicatrices.
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

- **Identidad de marca y cabecera institucional**:
  - Integración visual destacada del nombre oficial **Monte de Dios** en la cabecera superior y en el inicio de sesión.
  - Subtítulo formal "Nuevos servidores" manteniendo equilibrio estético y legibilidad tanto en móviles como en computadoras.
- **Tarjeta Open Graph y WhatsApp**:
  - Generación de la tarjeta oficial de previsualización en `public/assets/branding/og-preview.png` en resolución exacta de 1200 x 630 px con fondo de alto contraste, isotipo en tarjeta redondeada y tipografía clara para enlaces compartidos en WhatsApp y redes sociales.
- **Credenciales de acceso**:
  - Administradores: `marcos` y `cicatrices`.
  - Servidores: `servidor1` y `servidor2`.
