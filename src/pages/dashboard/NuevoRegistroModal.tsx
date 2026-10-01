import React from 'react';
import { X } from 'lucide-react';
import { FormularioRegistro } from '@/components/form/FormularioRegistro';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const NuevoRegistroModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Registrar nuevo servidor
            </h2>
            <p className="text-xs text-slate-500">
              Registro asistido por el equipo de servidores
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <FormularioRegistro />
        </div>
      </div>
    </div>
  );
};
