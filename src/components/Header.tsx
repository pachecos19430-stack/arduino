import React, { useState } from 'react';
import { Menu, User, LogIn, LogOut, Shield, Database, Flame, CheckCircle2 } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  currentSectionTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, currentSectionTitle }) => {
  const { currentUser, loginUser, signInWithGoogle, logoutUser, activeProject, isFirebaseLive } = useDatabase();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    loginUser(authEmail, authName);
    setShowAuthModal(false);
    setAuthEmail('');
    setAuthName('');
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
    } catch (e) {
      console.warn('Google sign-in popup cancelled or errored:', e);
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-btn"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menú de navegación"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 lg:hidden focus:outline-hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
              <span>{currentSectionTitle}</span>
              {activeProject && (
                <span className="hidden sm:inline-flex items-center text-xs font-normal text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <span className="text-slate-400 mr-1">Proyecto:</span> {activeProject.name}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firestore Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400">Firestore:</span>
            <span className="inline-flex items-center gap-1 font-mono text-emerald-400 font-semibold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              10 Colecciones
            </span>
          </div>

          {/* User Auth control */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-emerald-500/50 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs uppercase shadow-sm">
                  {currentUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {currentUser.displayName}
                </div>
                <div className="text-[10px] text-emerald-400/90 capitalize flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  {currentUser.role}
                </div>
              </div>
              <button
                id="btn-logout"
                onClick={logoutUser}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-login"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-medium text-xs transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceder (Firebase Auth)</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Autenticación de Usuario</h3>
                  <p className="text-xs text-slate-400">Acceso a MicroLab con Firebase</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Google Sign-in button */}
            <button
              id="btn-google-signin"
              onClick={handleGoogleSignIn}
              disabled={isSigningInGoogle}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-colors shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningInGoogle ? 'Conectando con Google...' : 'Continuar con Google (Firebase Auth)'}</span>
            </button>

            <div className="flex items-center gap-2 my-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[11px] text-slate-500 uppercase">o perfil rápido</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre Completo o Alias
                </label>
                <input
                  type="text"
                  placeholder="ej. Mateo Arduino"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="maker@microlab.io"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
