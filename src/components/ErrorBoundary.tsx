import * as Sentry from "@sentry/react";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";

const clearCachesAndReload = async () => {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const r of registrations) {
        await r.unregister();
      }
    }
    sessionStorage.clear();
    sessionStorage.setItem('chunk_retried', 'true');
  } catch (e) {
    console.error("Error al limpiar caché:", e);
  } finally {
    window.location.href = window.location.pathname + '?nocache=' + Date.now();
  }
};

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary detectó un error:", error, errorInfo);

    const msg = error.message || "";
    const isChunkError =
      msg.includes("ChunkLoadError") ||
      msg.includes("Loading chunk") ||
      msg.toLowerCase().includes("failed to fetch dynamically imported module") ||
      msg.toLowerCase().includes("error loading dynamically imported module") ||
      msg.toLowerCase().includes("load failed") ||
      msg.toLowerCase().includes("importing a module script failed") ||
      msg.toLowerCase().includes("expected a javascript module script") ||
      msg.toLowerCase().includes("mime type");

    if (isChunkError) {
      const hasRetried = sessionStorage.getItem("chunk_retried");
      if (!hasRetried) {
        sessionStorage.setItem("chunk_retried", "true");
        console.warn("Fallo de chunk detectado en despliegue. Limpiando caché y recargando...");
        clearCachesAndReload();
      }
    } else {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    }
  }

  private handleReload = () => {
    sessionStorage.removeItem("chunk_retried");
    clearCachesAndReload();
  };

  private handleCopy = async () => {
    const { error } = this.state;
    if (!error) return;

    // Protección Sentinel: No exponer stack traces internos en producción
    const isDev = import.meta.env.DEV;
    const text = isDev
      ? error.stack || error.toString()
      : `Error: ${error.message || 'Error inesperado'}\nFecha: ${new Date().toISOString()}`;

    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }
  };

  public render() {
    if (this.state.hasError) {
      const { copied } = this.state;
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-950 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ocurrió un error inesperado</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No pudimos cargar esta sección. Hemos registrado el incidente.
            </p>

            <div className="relative text-left">
              <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-auto text-xs text-red-600 dark:text-red-400 font-mono max-h-36 whitespace-pre-wrap break-words">
                {isDev ? (this.state.error?.stack || this.state.error?.toString()) : (this.state.error?.message || 'Error de ejecución en la aplicación.')}
              </pre>
              <button
                onClick={this.handleCopy}
                title="Copiar reporte al portapapeles"
                className="absolute top-2 right-2 flex items-center gap-1 rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-600" />
                    <span>Copiar reporte</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2">
              <Button onClick={this.handleReload} className="w-full gap-2 font-medium" size="lg">
                <RefreshCw className="h-4 w-4" /> Recargar página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}