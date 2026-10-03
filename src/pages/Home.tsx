import React from 'react';
import { Link } from 'react-router-dom';
import { FormularioRegistro } from '@/components/form/FormularioRegistro';
import { UserCheck } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0284c7] via-[#0f4cbe] to-[#08226b] flex flex-col relative overflow-hidden">
      {/* Elementos decorativos de fondo con iluminación estilo volante */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

      {/* Barra superior institucional */}
      <header className="bg-white/90 backdrop-blur-md border-b border-sky-100/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-sky-100 flex items-center justify-center p-1 shadow-xs">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Logo Monte de Dios"
                  width="36"
                  height="36"
                  fetchPriority="high"
                  className="w-full h-full object-contain"
                />
              </picture>
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 block leading-tight tracking-tight">
                Ministerio Internacional Monte de Dios
              </span>
              <span className="text-xs text-slate-500 block leading-tight mt-0.5">
                Nuevos servidores
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-sky-200 bg-sky-50/50 text-xs font-semibold text-blue-900 hover:bg-[#0a4abf] hover:text-white hover:border-[#0a4abf] transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Acceso servidores</span>
          </Link>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="text-center mb-8 space-y-3">
          {/* Pastilla 'Estamos solicitando' del volante */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-[#0a4abf] text-xs font-black uppercase tracking-wider shadow-md">
              Estamos solicitando
            </span>
          </div>

          {/* Título 'Nuevos servidores' en contenedor azul real */}
          <div>
            <h1 className="inline-block px-6 py-2 rounded-2xl bg-[#0a4abf] border border-sky-300/40 text-white font-black text-2xl sm:text-3xl tracking-tight shadow-lg">
              Nuevos servidores
            </h1>
          </div>

          {/* Subtítulo del volante */}
          <p className="text-white font-bold text-sm sm:text-base uppercase tracking-wide drop-shadow-xs">
            Ujieres, escuela dominical y seguridad
          </p>

          {/* Requisito formativo del volante */}
          <p className="text-sky-100 text-xs sm:text-sm font-normal">
            Debes haber cursado la{' '}
            <strong className="font-bold text-white">Escuela de nuevos creyentes</strong>
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-950/40 border-2 border-sky-200/80 p-6 sm:p-8">
          <FormularioRegistro />
        </div>
      </main>

      {/* Pie de página institucional */}
      <footer className="border-t border-blue-900/40 bg-blue-950/30 backdrop-blur-sm py-6 text-center text-xs text-sky-100/80 space-y-1 relative z-10">
        <p>Registro de nuevos servidores</p>
        <p>Ministerio Internacional Monte de Dios</p>
      </footer>
    </div>
  );
};