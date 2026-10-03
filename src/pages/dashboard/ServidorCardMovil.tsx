import React from 'react';
import type { ServidorRegistro, AreaServicio, EstadoRegistro } from '@/types';
import { Phone, Eye, MessageCircle } from 'lucide-react';

interface Props {
  servidor: ServidorRegistro;
  onSelect: (servidor: ServidorRegistro) => void;
  formatArea: (area: AreaServicio) => string;
  getEstadoBadge: (estado: EstadoRegistro) => React.ReactNode;
}

export const ServidorCardMovil: React.FC<Props> = ({
  servidor,
  onSelect,
  formatArea,
  getEstadoBadge,
}) => {
  const telDigits = servidor.telefono.replace(/\D/g, '');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <span className="font-bold text-slate-900 text-sm block">
            {servidor.nombre} {servidor.apellido}
          </span>
          <span className="text-[11px] text-slate-400">
            Registrado el {new Date(servidor.created_at).toLocaleDateString()}
          </span>
        </div>
        <div>{getEstadoBadge(servidor.estado)}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            Área deseada
          </span>
          <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
            {formatArea(servidor.area_servicio)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            Mentor
          </span>
          <span className="font-semibold text-slate-800 text-xs mt-0.5 block truncate">
            {servidor.nombre_mentor || 'Sin mentor'}
          </span>
        </div>
      </div>

      {/* Discipulado badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {servidor.bautizado && (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
            Bautizado
          </span>
        )}
        {servidor.retiro_liberacion && (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-100">
            Retiro
          </span>
        )}
        {servidor.escuela_nuevos_creyentes === 'si' && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100">
            Escuela
          </span>
        )}
        {servidor.asiste_casa_paz && (
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
            Casa de paz
          </span>
        )}
      </div>

      {/* Botones de acción móvil */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="font-medium">{servidor.telefono}</span>
        </div>

        <div className="flex items-center gap-2">
          {telDigits && (
            <a
              href={`https://wa.me/1${telDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onSelect(servidor)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors border border-blue-200"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver ficha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
