import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface Props {
  nombre: string;
  onNuevoRegistro: () => void;
}

export const RegistroExitoso: React.FC<Props> = ({ nombre, onNuevoRegistro }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignorar si no está soportado en el entorno
    }
  }, []);

  return (
    <div className="text-center py-8 px-4 space-y-6">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          Registro completado
          <br />
          con éxito
        </h2>
        <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
          Muchas gracias, {nombre?.trim()}
          <br />
          Su información ha sido recibida
          <br />
          correctamente por el equipo
          <br />
          de servidores de la iglesia.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 max-w-md mx-auto text-left">
        <p className="text-xs text-blue-900 font-medium">Próximos pasos</p>
        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
          Los líderes del área seleccionada se pondrán en contacto con usted mediante llamada o WhatsApp para coordinar.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onNuevoRegistro}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Registrar a otra persona
        </button>
      </div>
    </div>
  );
};
