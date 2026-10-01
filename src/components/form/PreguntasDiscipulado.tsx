import React from 'react';
import type { FormularioRegistroData } from '@/types';

interface Props {
  formData: FormularioRegistroData;
  onChange: (field: keyof FormularioRegistroData, value: string) => void;
}

export const PreguntasDiscipulado: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Escuela de nuevos creyentes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          ¿Realizó la escuela de nuevos creyentes? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['si', 'cursando', 'no'] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange('escuela_nuevos_creyentes', opt)}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                formData.escuela_nuevos_creyentes === opt
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt === 'si' ? 'Sí' : opt === 'cursando' ? 'Cursando' : 'No'}
            </button>
          ))}
        </div>
      </div>

      {/* Bautizado */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          ¿Está bautizado en aguas? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['si', 'no'] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange('bautizado', opt)}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                formData.bautizado === opt
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt === 'si' ? 'Sí' : 'No'}
            </button>
          ))}
        </div>
        {formData.bautizado === 'si' && (
          <div className="pt-1">
            <label htmlFor="fecha_bautismo" className="block text-xs font-medium text-slate-600 mb-1">
              Fecha de bautismo (aproximada si no recuerda el día exacto) <span className="text-red-500">*</span>
            </label>
            <input
              id="fecha_bautismo"
              type="date"
              required
              value={formData.fecha_bautismo}
              onChange={(e) => onChange('fecha_bautismo', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Retiro de liberación */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          ¿Fue al retiro de liberación? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['si', 'no'] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange('retiro_liberacion', opt)}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                formData.retiro_liberacion === opt
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt === 'si' ? 'Sí' : 'No'}
            </button>
          ))}
        </div>
        {formData.retiro_liberacion === 'si' && (
          <div className="pt-1">
            <label htmlFor="fecha_retiro" className="block text-xs font-medium text-slate-600 mb-1">
              Fecha de retiro (aproximada si no recuerda el día exacto) <span className="text-red-500">*</span>
            </label>
            <input
              id="fecha_retiro"
              type="date"
              required
              value={formData.fecha_retiro}
              onChange={(e) => onChange('fecha_retiro', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Mentor */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          ¿Tiene mentor actualmente? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['si', 'no'] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange('tiene_mentor', opt)}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                formData.tiene_mentor === opt
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt === 'si' ? 'Sí' : 'No'}
            </button>
          ))}
        </div>
        {formData.tiene_mentor === 'si' && (
          <div className="pt-1">
            <label htmlFor="nombre_mentor" className="block text-xs font-medium text-slate-600 mb-1">
              Nombre de su mentor <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre_mentor"
              type="text"
              required
              placeholder="Nombre del mentor"
              value={formData.nombre_mentor}
              onChange={(e) => onChange('nombre_mentor', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Casa de paz */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          ¿Asiste a una casa de paz? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['si', 'no'] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange('asiste_casa_paz', opt)}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                formData.asiste_casa_paz === opt
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt === 'si' ? 'Sí' : 'No'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
