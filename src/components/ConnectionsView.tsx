import React, { useState } from 'react';
import {
  GitFork,
  Plus,
  Trash2,
  Edit2,
  Cpu,
  Layers,
  Zap,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Connection } from '../types';

export const ConnectionsView: React.FC = () => {
  const {
    activeProject,
    boards,
    components,
    projectComponents,
    connections,
    createConnection,
    updateConnection,
    deleteConnection
  } = useDatabase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  // Current project elements
  const currentBoard = boards.find((b) => b.id === activeProject?.boardId);
  const currentProjectComps = projectComponents.filter(
    (pc) => pc.projectId === activeProject?.id
  );
  const currentConnections = connections.filter(
    (c) => c.projectId === activeProject?.id
  );

  // Form states
  const [formData, setFormData] = useState({
    projectComponentId: currentProjectComps[0]?.id || '',
    boardPin: currentBoard?.pinoutMap[0] || 'D4',
    componentPin: 'DATA',
    signalType: 'digital_in' as Connection['signalType'],
    wireColor: '#eab308',
    resistorOhm: 0,
    notes: ''
  });

  const handleOpenCreate = () => {
    setEditingConnection(null);
    setFormData({
      projectComponentId: currentProjectComps[0]?.id || '',
      boardPin: currentBoard?.pinoutMap[0] || 'D4',
      componentPin: 'DATA',
      signalType: 'digital_in',
      wireColor: '#3b82f6',
      resistorOhm: 0,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (conn: Connection) => {
    setEditingConnection(conn);
    setFormData({
      projectComponentId: conn.projectComponentId,
      boardPin: conn.boardPin,
      componentPin: conn.componentPin,
      signalType: conn.signalType,
      wireColor: conn.wireColor,
      resistorOhm: conn.resistorOhm || 0,
      notes: conn.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !formData.projectComponentId || !formData.boardPin) return;

    if (editingConnection) {
      updateConnection(editingConnection.id, {
        projectComponentId: formData.projectComponentId,
        boardPin: formData.boardPin,
        componentPin: formData.componentPin,
        signalType: formData.signalType,
        wireColor: formData.wireColor,
        resistorOhm: Number(formData.resistorOhm) || undefined,
        notes: formData.notes
      });
    } else {
      createConnection({
        projectId: activeProject.id,
        projectComponentId: formData.projectComponentId,
        boardPin: formData.boardPin,
        componentPin: formData.componentPin,
        signalType: formData.signalType,
        wireColor: formData.wireColor,
        resistorOhm: Number(formData.resistorOhm) || undefined,
        notes: formData.notes
      });
    }
    setIsModalOpen(false);
  };

  // Wire color presets
  const WIRE_COLORS = [
    { label: 'Rojo (VCC 3.3V/5V)', hex: '#ef4444' },
    { label: 'Negro (GND / Tierra)', hex: '#0f172a' },
    { label: 'Amarillo (Señal / Datos)', hex: '#eab308' },
    { label: 'Azul (I2C SDA / PWM)', hex: '#3b82f6' },
    { label: 'Verde (I2C SCL / Reloj)', hex: '#10b981' },
    { label: 'Púrpura / Morado (Interrupciones)', hex: '#a855f7' },
    { label: 'Naranja (UART TX/RX)', hex: '#f97316' }
  ];

  // Helper to find target component catalog item
  const getComponentDetails = (projCompId: string) => {
    const pc = projectComponents.find((p) => p.id === projCompId);
    const cat = components.find((c) => c.id === pc?.componentCatalogId);
    return { projectComp: pc, catalog: cat };
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-100">
              Mapeo de Conexiones & Pines (Wiring Matrix)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Colección: connections
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Asigna físicamente los pines del microcontrolador (
            <strong className="text-slate-300">{currentBoard?.name || 'Placa no asignada'}</strong>
            ) a cada pata de los componentes registrados.
          </p>
        </div>

        {currentProjectComps.length > 0 && currentBoard ? (
          <button
            id="btn-new-connection"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/10 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Conectar Pin</span>
          </button>
        ) : (
          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Agrega al menos un componente al proyecto para conectar pines.</span>
          </div>
        )}
      </div>

      {/* Visual Board Pinout Status */}
      {currentBoard && (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Pines de la placa {currentBoard.name}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Ocupados: {currentConnections.length} / {currentBoard.pinoutMap.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {currentBoard.pinoutMap.map((pin) => {
              const connected = currentConnections.find((c) => c.boardPin === pin);
              const compInfo = connected ? getComponentDetails(connected.projectComponentId) : null;

              return (
                <div
                  key={pin}
                  title={
                    connected
                      ? `Conectado a ${compInfo?.projectComp?.customLabel} (${connected.componentPin})`
                      : `Pin libre: ${pin}`
                  }
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all flex items-center gap-1.5 ${
                    connected
                      ? 'bg-slate-900 border-emerald-500/50 text-emerald-300 shadow-xs'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {connected && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: connected.wireColor }}
                    />
                  )}
                  <span>{pin}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connections List / Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Pin Placa</th>
                <th className="py-3 px-4">Componente Destino</th>
                <th className="py-3 px-4">Pin Componente</th>
                <th className="py-3 px-4">Tipo Señal</th>
                <th className="py-3 px-4">Color Cable</th>
                <th className="py-3 px-4">Resistencia</th>
                <th className="py-3 px-4">Notas</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentConnections.map((conn) => {
                const compInfo = getComponentDetails(conn.projectComponentId);

                return (
                  <tr key={conn.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      <div className="inline-flex items-center gap-1.5 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: conn.wireColor }}
                        />
                        {conn.boardPin}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div>{compInfo.projectComp?.customLabel || 'Desconocido'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {compInfo.catalog?.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{conn.componentPin}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                        {conn.signalType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-xs"
                          style={{ backgroundColor: conn.wireColor }}
                        />
                        <span className="font-mono text-[10px] text-slate-400">{conn.wireColor}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {conn.resistorOhm ? `${conn.resistorOhm} Ω` : 'Directo (0Ω)'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic max-w-xs truncate">
                      {conn.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(conn)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          title="Editar conexión"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Desconectar el pin ${conn.boardPin}?`)) {
                              deleteConnection(conn.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="Eliminar conexión"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {currentConnections.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No hay conexiones registradas para este proyecto todavía. Haz clic en "Conectar Pin" para iniciar el mapeo físico.
          </div>
        )}
      </div>

      {/* Modal Conexión de Pin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <GitFork className="w-5 h-5 text-emerald-400" />
                <span>{editingConnection ? 'Modificar Conexión de Pin' : 'Registrar Conexión de Pin'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Componente Asignado *
                  </label>
                  <select
                    value={formData.projectComponentId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectComponentId: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    {currentProjectComps.map((pc) => (
                      <option key={pc.id} value={pc.id}>
                        {pc.customLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pin del Componente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. VCC, GND, DATA, SDA, SCL, PWM"
                    value={formData.componentPin}
                    onChange={(e) => setFormData({ ...formData, componentPin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pin de la Placa ({currentBoard?.name || 'Board'}) *
                  </label>
                  <select
                    value={formData.boardPin}
                    onChange={(e) => setFormData({ ...formData, boardPin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
                  >
                    {currentBoard?.pinoutMap.map((pin) => (
                      <option key={pin} value={pin}>
                        {pin}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo de Señal Eléctrica
                  </label>
                  <select
                    value={formData.signalType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        signalType: e.target.value as Connection['signalType']
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="digital_in">Digital Input (Entrada)</option>
                    <option value="digital_out">Digital Output (Salida)</option>
                    <option value="analog_in">Analog Input (ADC)</option>
                    <option value="pwm">PWM / Señal Modulada</option>
                    <option value="i2c_sda">I2C Data (SDA)</option>
                    <option value="i2c_scl">I2C Clock (SCL)</option>
                    <option value="power_vcc">Alimentación VCC (3.3V / 5V)</option>
                    <option value="ground">Masa / GND</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Color del Cable (Wiring Color Code)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {WIRE_COLORS.map((w) => (
                    <button
                      type="button"
                      key={w.hex}
                      onClick={() => setFormData({ ...formData, wireColor: w.hex })}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${
                        formData.wireColor === w.hex
                          ? 'border-emerald-400 bg-slate-800 text-slate-100 font-semibold shadow-xs'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: w.hex }}
                      />
                      <span>{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Resistencia de Carga / Pull-up (Ω)
                  </label>
                  <input
                    type="number"
                    placeholder="0 si es directo, 4700, 10000..."
                    value={formData.resistorOhm}
                    onChange={(e) =>
                      setFormData({ ...formData, resistorOhm: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Notas de Cableado
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Cable trenzado de 20cm con conector Dupont."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
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
                  {editingConnection ? 'Guardar Cambios' : 'Registrar Conexión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
