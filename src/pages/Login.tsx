import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, Loader2, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/panel');
    }
    try {
      const saved = localStorage.getItem('servidores_creds');
      if (saved) {
        const { u } = JSON.parse(atob(saved));
        if (u) setUsername(u);
        setRememberMe(true);
      }
    } catch {
      // Ignorar fallo de almacenamiento
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const { error: signInError } = await signIn(username, password);

      if (signInError) {
        setError('Usuario o contraseña incorrectos');
      } else {
        if (rememberMe) {
          try {
            localStorage.setItem('servidores_creds', btoa(JSON.stringify({ u: username })));
          } catch {
            // Ignorar
          }
        } else {
          localStorage.removeItem('servidores_creds');
        }
        navigate('/panel');
      }
    } catch {
      setError('Ocurrió un error inesperado al iniciar sesión');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 relative overflow-hidden p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-200/80 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-20 h-20 mb-3 rounded-2xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center shadow-md shadow-slate-100">
              <picture className="w-full h-full flex items-center justify-center">
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Logo de la iglesia"
                  width="72"
                  height="72"
                  fetchPriority="high"
                  className="w-full h-full object-contain p-2"
                />
              </picture>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight text-center">
              Registro de nuevos servidores
            </h1>
            <p className="text-xs text-slate-500 mt-1">Acceso para servidores y administradores</p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6" />

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="username" className="block text-xs font-medium text-slate-700">
                Usuario o correo
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                placeholder="marcos, cicatrices o servidor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Recordar mi usuario</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando credenciales</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar al panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al formulario de registro</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};
