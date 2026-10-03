import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fetchServidores } from '@/lib/servidoresService';
import type { ServidorRegistro } from '@/types';
import { MetricasView } from './MetricasView';
import { TablaServidores } from './TablaServidores';
import { ModuloQr } from './ModuloQr';
import { UsuariosManager } from './UsuariosManager';
import { NuevoRegistroModal } from './NuevoRegistroModal';
import {
  Users,
  QrCode,
  UserPlus,
  LogOut,
  Shield,
  UserCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const PanelLayout: React.FC = () => {
  const { user, profile, role, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'registros' | 'qr' | 'usuarios'>('registros');
  const [servidores, setServidores] = useState<ServidorRegistro[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const loadData = async () => {
    setIsLoadingData(true);
    const data = await fetchServidores();
    setServidores(data);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleCerrarSesion = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Cargando panel de servidores
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      {/* Header institucional */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
              <img src="/logo.png" alt="Logo de la iglesia" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                Ministerio Internacional Monte de Dios
              </span>
              <span className="text-xs text-slate-500 block leading-tight">
                Panel de gestión de servidores
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrar persona</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-semibold text-slate-800 block">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-500 capitalize flex items-center gap-1 justify-end">
                  {isAdmin ? <Shield className="w-3 h-3 text-amber-500" /> : <UserCheck className="w-3 h-3 text-blue-500" />}
                  {role}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCerrarSesion}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal con pestañas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Selector de pestañas adaptable */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveTab('registros')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'registros'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Postulantes ({servidores.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'qr'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Código QR</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('usuarios')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  activeTab === 'usuarios'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Equipo y accesos</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoadingData}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <span>Ver formulario público</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Vistas según pestaña */}
        {activeTab === 'registros' && (
          <div className="space-y-6">
            <MetricasView servidores={servidores} />
            <TablaServidores servidores={servidores} onRefresh={loadData} />
          </div>
        )}

        {activeTab === 'qr' && <ModuloQr />}

        {activeTab === 'usuarios' && isAdmin && <UsuariosManager />}
      </main>

      {/* Modal para registrar un nuevo postulante */}
      {isModalOpen && (
        <NuevoRegistroModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};
