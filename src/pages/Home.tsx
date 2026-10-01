import React from 'react';
import { Link } from 'react-router-dom';
import { FormularioRegistro } from '@/components/form/FormularioRegistro';
import { ShieldCheck, UserCheck } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 flex flex-col">
      {/* Barra superior institucional */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Logo de la iglesia"
                  width="36"
                  height="36"
                  fetchPriority="high"
                  className="w-full h-full object-contain"
                />
              </picture>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                Nuevos servidores
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Acceso servidores</span>
          </Link>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Convocatoria abierta para servicio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Registro para nuevos servidores
          </h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
            Aquí puede completar sus datos personales para integrarse a los diferentes ministerios.
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8">
          <FormularioRegistro />
        </div>
      </main>

      {/* Pie de página */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1">
        <p>Registro de nuevos servidores</p>
        <p>Ministerio Internacional Monte de Dios</p>
      </footer>
    </div>
  );
};