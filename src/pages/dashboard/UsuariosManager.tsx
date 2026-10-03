import React, { useState } from 'react';
import { UserCheck, Shield, KeyRound, UserPlus } from 'lucide-react';
import type { UserRole } from '@/types';

interface UsuarioItem {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

const INITIAL_TEAM: UsuarioItem[] = [
  { id: '1', username: 'marcos', fullName: 'Marcos', role: 'admin' },
  { id: '2', username: 'kramos', fullName: 'Katherine Ramos', role: 'admin' },
  { id: '3', username: 'servidor1', fullName: 'Servidor 1', role: 'servidor' },
  { id: '4', username: 'servidor2', fullName: 'Servidor 2', role: 'servidor' },
];

export const UsuariosManager: React.FC = () => {
  const [usuarios] = useState<UsuarioItem[]>(INITIAL_TEAM);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Cuentas del equipo y accesos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de credenciales para administradores y servidores autorizados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-xl border border-blue-100">
            4 cuentas habilitadas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {u.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{u.fullName}</p>
                <p className="text-xs text-slate-500 truncate">Usuario: @{u.username}</p>
              </div>
            </div>

            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  u.role === 'admin'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                <span className="capitalize">{u.role}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
