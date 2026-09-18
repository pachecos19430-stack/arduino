import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  Cpu,
  Layers,
  Calendar,
  Tag,
  Star,
  ExternalLink,
  Search,
  CheckCircle2,
  PlayCircle,
  Clock
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Project } from '../types';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    boards,
    activeProjectId,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    projectComponents,
    connections,
    tests
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'prototyping' as Project['status'],
    boardId: boards[0]?.id || '',
    tags: 'ESP32, Sensores, IoT',
    notes: '',
    isFavorite: false
  });

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'prototyping',
      boardId: boards[0]?.id || '',
      tags: 'ESP32, Prototipo',
      notes: '',
      isFavorite: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormData({
      name: p.name,
      description: p.description,
      status: p.status,
      boardId: p.boardId,
      tags: p.tags.join(', '),
      notes: p.notes || '',
      isFavorite: !!p.isFavorite
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedTags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject) {
      updateProject(editingProject.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        boardId: formData.boardId,
        tags: parsedTags,
        notes: formData.notes,
        isFavorite: formData.isFavorite
      });
    } else {
      createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        boardId: formData.boardId,
        tags: parsedTags,
        notes: formData.notes,
        isFavorite: formData.isFavorite
      });
    }
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar proyectos por nombre, microcontrolador o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
          >
            <option value="all">Todos los estados</option>
            <option value="planning">Planificación</option>
            <option value="prototyping">Prototipado</option>
            <option value="testing">En pruebas</option>
            <option value="deployed">Desplegado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        <button
          id="btn-new-project"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const board = boards.find((b) => b.id === project.boardId);
          const componentsCount = projectComponents.filter((pc) => pc.projectId === project.id).length;
          const connectionsCount = connections.filter((c) => c.projectId === project.id).length;
          const testsCount = tests.filter((t) => t.projectId === project.id).length;
          const isActive = project.id === activeProjectId;

          return (
            <div
              key={project.id}
              className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden bg-slate-900/60 hover:bg-slate-900 ${
                isActive
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-5">
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-100 text-sm leading-tight hover:text-emerald-400 transition-colors">
                        {project.name}
                      </h3>
                      {project.isFavorite && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${
                        project.status === 'testing'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                          : project.status === 'prototyping'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                          : project.status === 'deployed'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {project.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(project)}
                      title="Editar proyecto"
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el proyecto "${project.name}" y sus registros de Firestore?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      title="Eliminar proyecto"
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Target Hardware / Board Info */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="text-left">
                      <div className="text-[11px] font-medium text-slate-300">
                        {board?.name || 'Sin placa asignada'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {board ? `${board.operatingVoltage} • ${board.microcontroller}` : 'Pendiente'}
                      </div>
                    </div>
                  </div>
                  {board?.hasWifi && (
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
                      Wi-Fi
                    </span>
                  )}
                </div>

                {/* Metrics badges */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/60 text-center">
                  <div>
                    <span className="block text-xs font-semibold text-slate-200">{componentsCount}</span>
                    <span className="text-[10px] text-slate-400">Componentes</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-200">{connectionsCount}</span>
                    <span className="text-[10px] text-slate-400">Pines Conectados</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-200">{testsCount}</span>
                    <span className="text-[10px] text-slate-400">Pruebas</span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-slate-800/80 text-slate-400 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

                {/* Footer Action */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => setActiveProjectId(project.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isActive ? '✓ Proyecto Activo' : 'Seleccionar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No se encontraron proyectos</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Intenta cambiar los filtros o crea un nuevo proyecto de Arduino o ESP32 para comenzar.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs"
          >
            Crear Primer Proyecto
          </button>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-emerald-400" />
                <span>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto MicroLab'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Estación Meteorológica ESP32, Robot Seguidor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del Proyecto
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe el objetivo, sensores involucrados o lógica de control..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Placa / Microcontrolador *
                  </label>
                  <select
                    value={formData.boardId}
                    onChange={(e) => setFormData({ ...formData, boardId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.operatingVoltage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estado del Proyecto
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as Project['status'] })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="planning">Planificación</option>
                    <option value="prototyping">Prototipado</option>
                    <option value="testing">En pruebas</option>
                    <option value="deployed">Desplegado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="ESP32, WiFi, I2C, MQTT"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas de Laboratorio / Hardware
                </label>
                <input
                  type="text"
                  placeholder="ej. Alimentar con 5V 2A externos. Pines SDA=D21, SCL=D22."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-fav"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="chk-fav" className="text-xs text-slate-300 cursor-pointer">
                  Marcar como proyecto destacado / favorito
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  {editingProject ? 'Guardar Cambios' : 'Registrar Proyecto en Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
