import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Search,
  Eye,
  Sliders,
  Tv,
  Thermometer,
  Zap,
  Cpu,
  Check,
  Tag
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ComponentCatalogItem, ComponentCategory } from '../types';

export const ComponentsView: React.FC = () => {
  const {
    components,
    createComponent,
    updateComponent,
    deleteComponent,
    activeProject,
    projectComponents,
    addProjectComponent,
    removeProjectComponent
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'catalog' | 'project'>('catalog');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ComponentCatalogItem | null>(null);

  // Quick assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<ComponentCatalogItem | null>(null);
  const [assignLabel, setAssignLabel] = useState('');
  const [assignQuantity, setAssignQuantity] = useState(1);
  const [assignNotes, setAssignNotes] = useState('');

  // Form states for creating/editing catalog component
  const [formData, setFormData] = useState({
    name: '',
    category: 'sensor' as ComponentCategory,
    model: '',
    operatingVoltage: '3.3V - 5V',
    protocol: 'digital' as ComponentCatalogItem['protocol'],
    defaultPinsText: 'VCC, GND, DATA',
    description: ''
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'sensor',
      model: '',
      operatingVoltage: '3.3V - 5V',
      protocol: 'digital',
      defaultPinsText: 'VCC, GND, SIGNAL',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ComponentCatalogItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      model: item.model,
      operatingVoltage: item.operatingVoltage,
      protocol: item.protocol,
      defaultPinsText: item.defaultPins.join(', '),
      description: item.description
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const pins = formData.defaultPinsText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    if (editingItem) {
      updateComponent(editingItem.id, {
        name: formData.name,
        category: formData.category,
        model: formData.model,
        operatingVoltage: formData.operatingVoltage,
        protocol: formData.protocol,
        defaultPins: pins,
        description: formData.description
      });
    } else {
      createComponent({
        name: formData.name,
        category: formData.category,
        model: formData.model,
        operatingVoltage: formData.operatingVoltage,
        protocol: formData.protocol,
        defaultPins: pins,
        description: formData.description
      });
    }
    setIsModalOpen(false);
  };

  const handleStartAssign = (catItem: ComponentCatalogItem) => {
    setSelectedCatalogItem(catItem);
    setAssignLabel(catItem.name);
    setAssignQuantity(1);
    setAssignNotes('');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !selectedCatalogItem) return;

    addProjectComponent({
      projectId: activeProject.id,
      componentCatalogId: selectedCatalogItem.id,
      customLabel: assignLabel || selectedCatalogItem.name,
      quantity: Number(assignQuantity) || 1,
      notes: assignNotes
    });

    setIsAssignModalOpen(false);
    setActiveTab('project');
  };

  const currentProjectItems = projectComponents.filter(
    (pc) => pc.projectId === activeProject?.id
  );

  const filteredCatalog = components.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.model.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Sub tabs: Catálogo General vs Componentes del Proyecto Activo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'catalog'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Catálogo Global de Componentes ({components.length})
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'project'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>En este Proyecto ({currentProjectItems.length})</span>
            {activeProject && (
              <span className="text-[10px] bg-slate-900/40 px-1.5 py-0.2 rounded font-normal">
                {activeProject.name.slice(0, 18)}...
              </span>
            )}
          </button>
        </div>

        {activeTab === 'catalog' && (
          <button
            id="btn-new-component"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear en Catálogo</span>
          </button>
        )}
      </div>

      {activeTab === 'catalog' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar sensor, servomotor, display OLED, botón, relé..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
              >
                <option value="all">Todas las categorías</option>
                <option value="sensor">Sensores (Temp, Luz, Distancia)</option>
                <option value="actuator">Actuadores (Motores, Relés, Servos)</option>
                <option value="display">Pantallas / Displays (OLED, LCD)</option>
                <option value="input">Entradas (Botones, Potenciómetros)</option>
                <option value="power">Alimentación / Reguladores</option>
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.protocol.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-100 text-sm mt-2">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{item.model}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Editar componente"
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${item.name}" del catálogo?`)) {
                            deleteComponent(item.id);
                          }
                        }}
                        title="Eliminar del catálogo"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 mb-4 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Tensión de Trabajo:</span>
                      <span className="font-mono text-slate-300 font-medium">
                        {item.operatingVoltage}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Pines Típicos:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {item.defaultPins.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 rounded"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                  {activeProject ? (
                    <button
                      onClick={() => handleStartAssign(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-medium transition-all"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Agregar a Proyecto</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Selecciona un proyecto</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab: Project Components */}
      {activeTab === 'project' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Componentes Instalados en: {activeProject?.name || 'Ningún proyecto seleccionado'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Colección Firestore: <code className="text-emerald-400">projectComponents</code>. Listos para asignar a pines en el módulo de Conexiones.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('catalog')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
            >
              + Explorar Catálogo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProjectItems.map((pc) => {
              const catItem = components.find((c) => c.id === pc.componentCatalogId);

              return (
                <div
                  key={pc.id}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {catItem?.category || 'componente'}
                        </span>
                        <h4 className="font-semibold text-slate-100 text-sm mt-1.5">
                          {pc.customLabel}
                        </h4>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Ref: {catItem?.name || pc.componentCatalogId}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`¿Quitar "${pc.customLabel}" del proyecto? Se eliminarán también sus conexiones de pines asociadas.`)) {
                            removeProjectComponent(pc.id);
                          }
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Quitar del proyecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 my-3 text-xs space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Cantidad:</span>
                        <span className="font-mono text-slate-200">{pc.quantity} ud.</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Protocolo:</span>
                        <span className="font-mono text-emerald-400 uppercase">
                          {catItem?.protocol || 'N/A'}
                        </span>
                      </div>
                      {pc.notes && (
                        <div className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">
                          Nota: {pc.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span>Agregado: {new Date(pc.addedAt).toLocaleDateString()}</span>
                    <span>ID: {pc.id}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {currentProjectItems.length === 0 && (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <Boxes className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">
                No hay componentes agregados a este proyecto
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Ve a la pestaña "Catálogo Global de Componentes" y presiona "Agregar a Proyecto".
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Quick Assign to Project */}
      {isAssignModalOpen && selectedCatalogItem && activeProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Agregar a "{activeProject.name}"
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Componente seleccionado: <strong className="text-emerald-400">{selectedCatalogItem.name}</strong>
            </p>

            <form onSubmit={handleConfirmAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Etiqueta o Nombre Personalizado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Sensor DHT Exterior, Servo Dirección"
                  value={assignLabel}
                  onChange={(e) => setAssignLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={assignQuantity}
                    onChange={(e) => setAssignQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Protocolo
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedCatalogItem.protocol.toUpperCase()}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas de Instalación
                </label>
                <input
                  type="text"
                  placeholder="ej. Resistencia pull-up de 4.7k requerida."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  Confirmar e Instalar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create/Edit Catalog Component */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <span>{editingItem ? 'Editar Componente de Catálogo' : 'Crear Componente en Catálogo'}</span>
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
                  Nombre del Componente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. DHT22, Servomotor SG90, Pantalla OLED 0.96, Relé 5V"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ComponentCategory })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="sensor">Sensor</option>
                    <option value="actuator">Actuador / Motor</option>
                    <option value="display">Display / Pantalla</option>
                    <option value="input">Entrada / Pulsador</option>
                    <option value="power">Alimentación</option>
                    <option value="communication">Comunicación</option>
                    <option value="passive">Pasivo (Resistencia/Capacitor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Modelo / Fabricante
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. SSD1306, Micro 9g, HC-SR04"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Voltaje de Operación
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 3.3V - 5V"
                    value={formData.operatingVoltage}
                    onChange={(e) =>
                      setFormData({ ...formData, operatingVoltage: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Protocolo / Señal
                  </label>
                  <select
                    value={formData.protocol}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        protocol: e.target.value as ComponentCatalogItem['protocol']
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="digital">Digital IO</option>
                    <option value="analog">Analógico (ADC)</option>
                    <option value="i2c">I2C (SDA / SCL)</option>
                    <option value="spi">SPI</option>
                    <option value="pwm">PWM</option>
                    <option value="uart">UART (Serial)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pines Típicos requeridos (separados por coma) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. VCC, GND, SDA, SCL"
                  value={formData.defaultPinsText}
                  onChange={(e) => setFormData({ ...formData, defaultPinsText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción Técnica
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre rangos de medición, precauciones de corriente o conexión..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden resize-none"
                />
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
                  {editingItem ? 'Guardar Cambios' : 'Guardar en Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
