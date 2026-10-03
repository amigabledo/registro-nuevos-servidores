import React, { useState } from 'react';
import type { FormularioRegistroData } from '@/types';
import { PreguntasDiscipulado } from './PreguntasDiscipulado';
import { RegistroExitoso } from './RegistroExitoso';
import { registrarServidor } from '@/lib/servidoresService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Send } from 'lucide-react';

const INITIAL_FORM: FormularioRegistroData = {
  nombre: '',
  apellido: '',
  telefono: '',
  correo: '',
  escuela_nuevos_creyentes: 'si',
  bautizado: 'si',
  fecha_bautismo: '',
  retiro_liberacion: 'si',
  fecha_retiro: '',
  tiene_mentor: 'si',
  nombre_mentor: '',
  asiste_casa_paz: 'si',
  area_servicio: '',
};

export const FormularioRegistro: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormularioRegistroData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof FormularioRegistroData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.telefono.trim() ||
      !formData.correo.trim()
    ) {
      setErrorMessage('Por favor complete todos sus datos personales obligatorios');
      return;
    }

    if (formData.bautizado === 'si' && !formData.fecha_bautismo) {
      setErrorMessage('Por favor ingrese la fecha de su bautismo');
      return;
    }

    if (formData.retiro_liberacion === 'si' && !formData.fecha_retiro) {
      setErrorMessage('Por favor ingrese la fecha de su retiro de liberación');
      return;
    }

    if (formData.tiene_mentor === 'si' && !formData.nombre_mentor.trim()) {
      setErrorMessage('Por favor ingrese el nombre de su mentor');
      return;
    }

    if (!formData.area_servicio) {
      setErrorMessage('Por favor seleccione el área en que desea servir');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registrarServidor(formData, user?.id);
      if (result.success) {
        setIsCompleted(true);
      } else {
        setErrorMessage(result.error || 'Ocurrió un error al enviar el formulario');
      }
    } catch {
      setErrorMessage('Ocurrió un error inesperado al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNuevoRegistro = () => {
    setFormData(INITIAL_FORM);
    setIsCompleted(false);
    setErrorMessage(null);
  };

  if (isCompleted) {
    return <RegistroExitoso nombre={formData.nombre.trim()} onNuevoRegistro={handleNuevoRegistro} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Datos personales */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-1 border-b border-sky-100">
          Datos personales
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              required
              placeholder="Su nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0a4abf] transition-all"
            />
          </div>

          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-slate-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              id="apellido"
              type="text"
              required
              placeholder="Su apellido"
              value={formData.apellido}
              onChange={(e) => handleChange('apellido', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0a4abf] transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono o WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="telefono"
              type="tel"
              required
              placeholder="809-000-0000"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0a4abf] transition-all"
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="correo"
              type="email"
              required
              placeholder="ejemplo@correo.com"
              value={formData.correo}
              onChange={(e) => handleChange('correo', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0a4abf] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Preguntas de discipulado sin encabezado de trayectoria */}
      <div className="space-y-4 pt-2">
        <PreguntasDiscipulado formData={formData} onChange={handleChange} />
      </div>

      {/* Área ministerial deseada */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 pb-1 border-b border-sky-100">
          Área en que desea servir <span className="text-red-500">*</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'ujieres', label: 'Ujieres' },
            { id: 'seguridad', label: 'Seguridad' },
            { id: 'escuela_dominical', label: 'Escuela dominical' },
          ].map((area) => (
            <button
              type="button"
              key={area.id}
              onClick={() => handleChange('area_servicio', area.id)}
              className={`py-3 px-4 rounded-xl border text-center transition-all ${
                formData.area_servicio === area.id
                  ? 'border-[#0a4abf] bg-gradient-to-r from-[#0a4abf] to-[#0284c7] text-white shadow-md ring-2 ring-sky-300'
                  : 'border-slate-200 bg-slate-50 hover:bg-sky-50/60 hover:border-sky-300 text-slate-800'
              }`}
            >
              <span className={`text-sm font-bold ${formData.area_servicio === area.id ? 'text-white' : 'text-slate-800'}`}>
                {area.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Botón de envío */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0a4abf] to-[#0284c7] hover:from-[#083b99] hover:to-[#0369a1] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/25 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando información</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar registro</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
