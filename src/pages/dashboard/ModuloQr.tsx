import React, { useRef, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Download, Copy, Check, Maximize2, X, ExternalLink } from 'lucide-react';

const REGISTRO_URL = 'https://registro-nuevos-servidores.pages.dev/';

export const ModuloQr: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCopiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(REGISTRO_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignorar si el portapapeles falla
    }
  };

  const handleDescargarPng = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'codigo-qr-nuevos-servidores.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="space-y-6">
      {/* Contenedor del generador */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-xl mx-auto text-center space-y-6">
        <div className="space-y-1">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Código QR de autorregistro
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Proyecta este código en las pantallas de la iglesia o imprímelo en afiches para que los hermanos lo escaneen desde sus celulares.
          </p>
        </div>

        {/* Visualización del QR */}
        <div className="inline-block p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
          <QRCodeSVG
            value={REGISTRO_URL}
            size={220}
            level="H"
            includeMargin
            imageSettings={{
              src: '/logo.png',
              x: undefined,
              y: undefined,
              height: 48,
              width: 48,
              excavate: true,
            }}
          />

          {/* Canvas oculto para descarga en alta calidad */}
          <div ref={canvasRef} className="hidden">
            <QRCodeCanvas
              value={REGISTRO_URL}
              size={600}
              level="H"
              includeMargin
              imageSettings={{
                src: '/logo.png',
                x: undefined,
                y: undefined,
                height: 120,
                width: 120,
                excavate: true,
              }}
            />
          </div>
        </div>

        {/* Enlace y acciones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-mono text-slate-600 truncate">{REGISTRO_URL}</span>
            <button
              type="button"
              onClick={handleCopiarEnlace}
              className="ml-2 inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={handleDescargarPng}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Descargar imagen PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setIsProjectorMode(true)}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Modo proyector (pantalla)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal modo proyector en pantalla completa */}
      {isProjectorMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
          <button
            type="button"
            onClick={() => setIsProjectorMode(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-md w-full space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white p-2">
              <img src="/logo.png" alt="Logo de la iglesia" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Únete al equipo de servidores
              </h2>
              <p className="text-slate-400 text-sm">
                Escanea el código con tu celular para registrarte
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white inline-block shadow-2xl">
              <QRCodeSVG
                value={REGISTRO_URL}
                size={300}
                level="H"
                includeMargin
                imageSettings={{
                  src: '/logo.png',
                  x: undefined,
                  y: undefined,
                  height: 64,
                  width: 64,
                  excavate: true,
                }}
              />
            </div>

            <p className="font-mono text-xs text-slate-400">
              {REGISTRO_URL}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
