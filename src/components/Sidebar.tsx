import React from 'react';
import {
  Cpu,
  FolderGit2,
  Boxes,
  GitFork,
  CheckSquare,
  Activity,
  Stethoscope,
  Clock,
  Settings,
  Flame,
  ChevronRight,
  Database
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export type SectionType =
  | 'projects'
  | 'hardware'
  | 'components'
  | 'connections'
  | 'tests'
  | 'monitoring'
  | 'diagnostics'
  | 'history'
  | 'settings';

interface SidebarProps {
  currentSection: SectionType;
  onSelectSection: (section: SectionType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile
}) => {
  const {
    projects,
    activeProject,
    setActiveProjectId,
    boards,
    components,
    connections,
    tests,
    isFirebaseLive
  } = useDatabase();

  const navItems: { id: SectionType; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'projects', label: 'Proyectos', icon: <FolderGit2 className="w-4 h-4" />, badge: projects.length },
    { id: 'hardware', label: 'Hardware (Placas)', icon: <Cpu className="w-4 h-4" />, badge: boards.length },
    { id: 'components', label: 'Componentes', icon: <Boxes className="w-4 h-4" />, badge: components.length },
    { id: 'connections', label: 'Conexiones & Pines', icon: <GitFork className="w-4 h-4" />, badge: connections.length },
    { id: 'tests', label: 'Pruebas & Test', icon: <CheckSquare className="w-4 h-4" />, badge: tests.length },
    { id: 'monitoring', label: 'Monitoreo', icon: <Activity className="w-4 h-4" />, badge: 'Sim' },
    { id: 'diagnostics', label: 'Diagnóstico', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'history', label: 'Historial & Logs', icon: <Clock className="w-4 h-4" /> },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-100 tracking-tight">MicroLab</span>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Lab de Microcontroladores</p>
            </div>
          </div>
        </div>

        {/* Project Quick Selector */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/40">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
            Proyecto Activo
          </label>
          <select
            id="sidebar-project-selector"
            aria-label="Seleccionar proyecto activo"
            value={activeProject?.id || ''}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {activeProject && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[140px] text-slate-300">
                {boards.find((b) => b.id === activeProject.boardId)?.name || 'Sin placa'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  activeProject.status === 'testing'
                    ? 'bg-amber-500/15 text-amber-400'
                    : activeProject.status === 'prototyping'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-slate-700/50 text-slate-300'
                }`}
              >
                {activeProject.status}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Módulos del Laboratorio
          </div>
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database & Firebase Status Indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Capa Firestore</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                isFirebaseLive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isFirebaseLive ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
              />
              {isFirebaseLive ? 'Enlace Nube Activo' : 'Firestore Local'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            10 colecciones sincronizadas. Preparado para hardware IoT en fase 2.
          </p>
        </div>
      </aside>
    </>
  );
};
