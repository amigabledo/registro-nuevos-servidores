import React, { useState } from 'react';
import type { ServidorRegistro, EstadoRegistro } from '@/types';
import { X, Check, Phone, Mail, Calendar, User, Shield, CheckCircle2, Clock } from 'lucide-react';
import { actualizarEstadoServidor } from '@/lib/servidoresService';

interface Props {
  servidor: ServidorRegistro;
  onClose: () => void;
  onUpdate: () => void;
}

const ESTADOS: { id: EstadoRegistro; label: string; color: string }[] = [
  { id: 'pendiente', label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
  { id: 'en_revision', label: 'En revisión', color: 'bg-blue-100 text-blue-800' },
  { id: 'contactado', label: 'Contactado', color: 'bg-purple-100 text-purple-800' },
  { id: 'aprobado', label: 'Aprobado', color: 'bg-emerald-100 text-emerald-800' },
];

export const DetalleServidorModal: React.FC<Props> = ({ servidor, onClose, onUpdate }) => {
  const [estado, setEstado] = useState<EstadoRegistro>(servidor.estado);
  const [notas, setNotas] = useState(servidor.notas_servidor || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleGuardar = async () => {
    setIsSaving(true);
    await actualizarEstadoServidor(servidor.id, estado, notas);
    setIsSaving(false);
    onUpdate();
    onClose();
  };

  const getAreaLabel = (area: string) => {
    if (area === 'ujieres') return 'Ujieres';
    if (area === 'seguridad') return 'Seguridad';
    if (area === 'escuela_dominical') return 'Escuela dominical';
    return area;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {servidor.nombre} {servidor.apellido}
            </h2>
            <span className="text-xs text-slate-500">
              Postulante para {getAreaLabel(servidor.area_servicio)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          {/* Contacto */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Información de contacto
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Teléfono</span>
                  <span className="font-bold text-slate-900 text-sm">{servidor.telefono}</span>
                </div>
              </div>
              <a
                href={`https://wa.me/1${servidor.telefono.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Trayectoria */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Discipulado y formación
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span>Escuela de nuevos creyentes:</span>
                <span className="font-semibold capitalize text-slate-900">
                  {servidor.escuela_nuevos_creyentes === 'si'
                    ? 'Completada'
                    : servidor.escuela_nuevos_creyentes === 'cursando'
                    ? 'En curso'
                    : 'No realizada'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span>Bautizado en aguas:</span>
                <span className="font-semibold text-slate-900">
                  {servidor.bautizado ? `Sí (${servidor.fecha_bautismo || 'Sin fecha'})` : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span>Retiro de liberación:</span>
                <span className="font-semibold text-slate-900">
                  {servidor.retiro_liberacion ? `Sí (${servidor.fecha_retiro || 'Sin fecha'})` : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span>Mentor:</span>
                <span className="font-semibold text-slate-900">
                  {servidor.tiene_mentor ? `Sí - ${servidor.nombre_mentor || 'No especificado'}` : 'No tiene'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span>Asiste a casa de paz:</span>
                <span className="font-semibold text-slate-900">
                  {servidor.asiste_casa_paz ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Gestión de estado */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estado de la postulación
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {ESTADOS.map((est) => (
                <button
                  type="button"
                  key={est.id}
                  onClick={() => setEstado(est.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    estado === est.id
                      ? `${est.color} border-current shadow-xs`
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {est.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label htmlFor="notas" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Notas internas del servidor
            </label>
            <textarea
              id="notas"
              rows={3}
              placeholder="Observaciones de entrevista o disponibilidad horaria"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
