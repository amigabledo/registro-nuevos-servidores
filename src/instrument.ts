import * as Sentry from "@sentry/react";

// Nombre del proyecto dinámico para identificar los errores en el panel de Sentry
const projectName = import.meta.env.VITE_PROJECT_NAME || "plantilla-base-stack";
const sentryDsn = import.meta.env.VITE_SENTRY_DSN || "https://dfff1b96a3e98d753f2de22b3e5a3876@o4511617543897088.ingest.us.sentry.io/4511617556086784";

Sentry.init({
  dsn: sentryDsn,
  environment: import.meta.env.MODE,
  release: `${projectName}@${import.meta.env.VITE_APP_VERSION || "1.0.0"}`,
  initialScope: {
    tags: {
      project: projectName,
      app_name: projectName,
    },
  },
  // Monitorización de errores. Omitimos Tracing y Session Replay pesados para máxima ligereza y privacidad.
  ignoreErrors: [
    "Failed to fetch dynamically imported module",
    "error loading dynamically imported module",
    "Importing a module script failed",
    "expected a javascript module script",
    "'text/html' is not a valid JavaScript MIME type",
    /Loading chunk .* failed/i,
    /ChunkLoadError/i,
    /MIME type/i,
    /Failed to unregister a ServiceWorkerRegistration/i,
    "Error invoking postMessage: Java object is gone",
    /Java object is gone/i,
  ],
  denyUrls: [
    /localhost/,
    /127\.0\.0\.1/,
  ],
});

// Forzar tags globales en todos los eventos y excepciones
Sentry.setTag("project", projectName);
Sentry.setTag("app_name", projectName);
