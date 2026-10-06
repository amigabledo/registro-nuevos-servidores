import React, { useState, useMemo } from 'react';
import type { ServidorRegistro, AreaServicio, EstadoRegistro } from '@/types';
import { DetalleServidorModal } from './DetalleServidorModal';
import { ServidorCardMovil } from './ServidorCardMovil';
import { Search, Phone, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import { exportarExcel, exportarPDF } from '@/lib/exportUtils';

interface Props {
  servidores: ServidorRegistro[];
  onRefresh: () => void;
}

export const TablaServidores: React.FC<Props> = ({ servidores, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('todos');
  const [mentorFilter, setMentorFilter] = useState<string>('todos');
  const [selectedServidor, setSelectedServidor] = useState<ServidorRegistro | null>(null);

  const filteredServidores = useMemo(() => {
    return servidores.filter((s) => {
      const matchSearch =
        `${s.nombre} ${s.apellido} ${s.telefono} ${s.correo || ''} ${s.nombre_mentor || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchArea = areaFilter === 'todos' || s.area_servicio === areaFilter;

      const matchMentor =
        mentorFilter === 'todos' ||
        (mentorFilter === 'sin_mentor' && !s.tiene_mentor) ||
        (mentorFilter === 'con_mentor' && s.tiene_mentor);

      return matchSearch && matchArea && matchMentor;
    });
  }, [servidores, searchTerm, areaFilter, mentorFilter]);

  const formatArea = (area: AreaServicio) => {
    if (area === 'ujieres') return 'Ujieres';
    if (area === 'seguridad') return 'Seguridad';
    if (area === 'escuela_dominical') return 'Escuela dominical';
    return area;
  };

  const getEstadoBadge = (estado: EstadoRegistro) => {
    const styles: Record<EstadoRegistro, string> = {
      pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
      en_revision: 'bg-blue-50 text-blue-700 border-blue-200',
      contactado: 'bg-purple-50 text-purple-700 border-purple-200',
      aprobado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    const labels: Record<EstadoRegistro, string> = {
      pendiente: 'Pendiente',
      en_revision: 'En revisión',
      contactado: 'Contactado',
      aprobado: 'Aprobado',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles[estado]}`}>
        {labels[estado]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, correo o mentor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por ministerio escogido */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            aria-label="Filtrar por ministerio escogido"
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="todos">Todos los ministerios</option>
            <option value="ujieres">Ujieres</option>
            <option value="seguridad">Seguridad</option>
            <option value="escuela_dominical">Escuela dominical</option>
          </select>

          {/* Filtro por mentor (reemplaza el filtro de estados) */}
          <select
            value={mentorFilter}
            onChange={(e) => setMentorFilter(e.target.value)}
            aria-label="Filtrar por mentor"
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="todos">Todos los mentores</option>
            <option value="sin_mentor">Sin mentor</option>
            <option value="con_mentor">Con mentor</option>
          </select>

          {/* Botones de exportación Excel y PDF */}
          <button
            type="button"
            onClick={() => exportarExcel(filteredServidores)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-xs"
            title="Exportar archivo de Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={() => exportarPDF(filteredServidores)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
            title="Exportar documento PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Vista móvil para teléfonos */}
      <div className="sm:hidden space-y-3">
        {filteredServidores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs shadow-xs">
            No se encontraron registros que coincidan con la búsqueda.
          </div>
        ) : (
          filteredServidores.map((s) => (
            <ServidorCardMovil
              key={s.id}
              servidor={s}
              onSelect={setSelectedServidor}
              formatArea={formatArea}
              getEstadoBadge={getEstadoBadge}
            />
          ))
        )}
      </div>

      {/* Vista para tablet y escritorio (tabla estructurada) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Postulante</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Ministerio</th>
                <th className="py-3 px-4">Mentor</th>
                <th className="py-3 px-4">Discipulado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServidores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredServidores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {s.nombre} {s.apellido}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{s.telefono}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{formatArea(s.area_servicio)}</span>
                    </td>
                    <td className="py-3 px-4">
                      {s.tiene_mentor ? (
                        <div>
                          <span className="inline-block px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold mb-0.5">
                            Tiene mentor
                          </span>
                          <span className="text-[11px] text-slate-600 block truncate max-w-[140px]" title={s.nombre_mentor || ''}>
                            {s.nombre_mentor || 'Asignado'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                          Sin mentor
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.bautizado && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px]">
                            Bautizado
                          </span>
                        )}
                        {s.retiro_liberacion && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px]">
                            Retiro
                          </span>
                        )}
                        {s.escuela_nuevos_creyentes === 'si' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px]">
                            Escuela
                          </span>
                        )}
                        {s.asiste_casa_paz && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px]">
                            Casa de paz
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getEstadoBadge(s.estado)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/1${s.telefono.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Enviar mensaje por WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedServidor(s)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver ficha</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedServidor && (
        <DetalleServidorModal
          servidor={selectedServidor}
          onClose={() => setSelectedServidor(null)}
          onUpdate={onRefresh}
        />
      )}
    </div>
  );
};
