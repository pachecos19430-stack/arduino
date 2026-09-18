import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  Bug,
  Database,
  Terminal
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const HistoryLogsView: React.FC = () => {
  const { logs, clearLogs, activeProject } = useDatabase();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [onlyCurrentProject, setOnlyCurrentProject] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesProject = !onlyCurrentProject || !log.projectId || log.projectId === activeProject?.id;
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));

    return matchesProject && matchesLevel && matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Historial de Eventos & Registros de Firestore</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Colección: logs
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Auditoría cronológica de cambios en hardware, pines asociados, pruebas ejecutadas y eventos del sistema.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('¿Vaciar todo el historial de logs?')) {
              clearLogs();
            }
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpiar Consola</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en el registro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
          >
            <option value="all">Todos los niveles</option>
            <option value="info">INFO</option>
            <option value="warn">WARN</option>
            <option value="error">ERROR</option>
            <option value="debug">DEBUG</option>
          </select>

          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
          >
            <option value="all">Todos los módulos</option>
            <option value="hardware">Hardware</option>
            <option value="pins">Pines & Conexiones</option>
            <option value="component">Componentes</option>
            <option value="test">Pruebas</option>
            <option value="firmware_stub">Firmware Stub</option>
            <option value="system">Sistema</option>
          </select>
        </div>

        {activeProject && (
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={onlyCurrentProject}
              onChange={(e) => setOnlyCurrentProject(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>Solo proyecto activo</span>
          </label>
        )}
      </div>

      {/* Logs Table / Stream */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              Terminal de Auditoría ({filteredLogs.length} entradas)
            </span>
          </div>
          <span className="font-mono text-[10px]">Almacenamiento: Firestore / local-cache</span>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] font-semibold tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Hora</th>
                <th className="py-2.5 px-4">Nivel</th>
                <th className="py-2.5 px-4">Módulo</th>
                <th className="py-2.5 px-4">Mensaje / Detalle</th>
                <th className="py-2.5 px-4 font-mono text-right">Log ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="py-2 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          log.level === 'error'
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            : log.level === 'warn'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : log.level === 'debug'
                            ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-sans text-[10px] capitalize">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-200 font-sans text-xs">
                      {log.message}
                    </td>
                    <td className="py-2 px-4 text-slate-400 text-[10px] text-right">
                      {log.id.slice(0, 10)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay entradas de registro que coincidan con los filtros.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
