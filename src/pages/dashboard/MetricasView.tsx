import React from 'react';
import type { ServidorRegistro } from '@/types';
import { Users, Shield, HeartHandshake, BookOpen, CheckCircle, Flame, Home as HomeIcon } from 'lucide-react';

interface Props {
  servidores: ServidorRegistro[];
}

export const MetricasView: React.FC<Props> = ({ servidores }) => {
  const total = servidores.length;
  const ujieres = servidores.filter((s) => s.area_servicio === 'ujieres').length;
  const seguridad = servidores.filter((s) => s.area_servicio === 'seguridad').length;
  const escuela = servidores.filter((s) => s.area_servicio === 'escuela_dominical').length;

  const bautizados = servidores.filter((s) => s.bautizado).length;
  const retiro = servidores.filter((s) => s.retiro_liberacion).length;
  const escuelaCreyentes = servidores.filter((s) => s.escuela_nuevos_creyentes === 'si').length;
  const casaPaz = servidores.filter((s) => s.asiste_casa_paz).length;

  const calcPct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <div className="space-y-6">
      {/* Tarjetas principales por área */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total registrados
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{total}</p>
          <p className="text-xs text-slate-500 mt-1">Postulantes a servicio</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ujieres
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{ujieres}</p>
          <p className="text-xs text-slate-500 mt-1">{calcPct(ujieres)}% del total</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Seguridad
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{seguridad}</p>
          <p className="text-xs text-slate-500 mt-1">{calcPct(seguridad)}% del total</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Escuela dominical
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{escuela}</p>
          <p className="text-xs text-slate-500 mt-1">{calcPct(escuela)}% del total</p>
        </div>
      </div>

      {/* Indicadores de trayectoria y discipulado */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
          Avance de discipulado en postulantes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Bautizados</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{bautizados} / {total}</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${calcPct(bautizados)}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">{calcPct(bautizados)}% completado</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Retiro de liberación</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{retiro} / {total}</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${calcPct(retiro)}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">{calcPct(retiro)}% completado</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold mb-1">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Escuela creyentes</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{escuelaCreyentes} / {total}</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${calcPct(escuelaCreyentes)}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">{calcPct(escuelaCreyentes)}% completado</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold mb-1">
              <HomeIcon className="w-4 h-4 text-indigo-500" />
              <span>Casa de paz</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{casaPaz} / {total}</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${calcPct(casaPaz)}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">{calcPct(casaPaz)}% activo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
