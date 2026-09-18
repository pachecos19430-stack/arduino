import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  Edit2,
  Zap,
  Wifi,
  Bluetooth,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Board, BoardFamily } from '../types';

export const HardwareView: React.FC = () => {
  const { boards, createBoard, updateBoard, deleteBoard, projects } = useDatabase();
  const [search, setSearch] = useState('');
  const [filterFamily, setFilterFamily] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    family: 'esp32' as BoardFamily,
    microcontroller: '',
    operatingVoltage: '3.3V' as Board['operatingVoltage'],
    digitalPins: 20,
    analogPins: 8,
    pwmPins: 6,
    hasWifi: false,
    hasBluetooth: false,
    clockSpeedMhz: 160,
    flashMemoryKb: 4096,
    pinoutMapText: 'D0, D1, D2, D4, D5, D12, D13, D14, D15, D18, D19, D21, D22, D23, A0, 3V3, GND, VIN',
    description: ''
  });

  const handleOpenCreate = () => {
    setEditingBoard(null);
    setFormData({
      name: '',
      family: 'esp32',
      microcontroller: 'ESP-WROOM-32',
      operatingVoltage: '3.3V',
      digitalPins: 25,
      analogPins: 12,
      pwmPins: 16,
      hasWifi: true,
      hasBluetooth: true,
      clockSpeedMhz: 240,
      flashMemoryKb: 4096,
      pinoutMapText: '3V3, GND, D2, D4, D5, D12, D13, D14, D15, D18, D19, D21, D22, D23, D25, D26, D27, D32, D33, VIN',
      description: 'Módulo microcontrolador para prototipado rápido.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Board) => {
    setEditingBoard(b);
    setFormData({
      name: b.name,
      family: b.family,
      microcontroller: b.microcontroller,
      operatingVoltage: b.operatingVoltage,
      digitalPins: b.digitalPins,
      analogPins: b.analogPins,
      pwmPins: b.pwmPins,
      hasWifi: b.hasWifi,
      hasBluetooth: b.hasBluetooth,
      clockSpeedMhz: b.clockSpeedMhz,
      flashMemoryKb: b.flashMemoryKb,
      pinoutMapText: b.pinoutMap.join(', '),
      description: b.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedPins = formData.pinoutMapText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    if (editingBoard) {
      updateBoard(editingBoard.id, {
        name: formData.name,
        family: formData.family,
        microcontroller: formData.microcontroller,
        operatingVoltage: formData.operatingVoltage,
        digitalPins: Number(formData.digitalPins),
        analogPins: Number(formData.analogPins),
        pwmPins: Number(formData.pwmPins),
        hasWifi: formData.hasWifi,
        hasBluetooth: formData.hasBluetooth,
        clockSpeedMhz: Number(formData.clockSpeedMhz),
        flashMemoryKb: Number(formData.flashMemoryKb),
        pinoutMap: parsedPins,
        description: formData.description
      });
    } else {
      createBoard({
        name: formData.name,
        family: formData.family,
        microcontroller: formData.microcontroller,
        operatingVoltage: formData.operatingVoltage,
        digitalPins: Number(formData.digitalPins),
        analogPins: Number(formData.analogPins),
        pwmPins: Number(formData.pwmPins),
        hasWifi: formData.hasWifi,
        hasBluetooth: formData.hasBluetooth,
        clockSpeedMhz: Number(formData.clockSpeedMhz),
        flashMemoryKb: Number(formData.flashMemoryKb),
        pinoutMap: parsedPins,
        description: formData.description
      });
    }
    setIsModalOpen(false);
  };

  const filteredBoards = boards.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.microcontroller.toLowerCase().includes(search.toLowerCase());
    const matchFamily = filterFamily === 'all' || b.family === filterFamily;
    return matchSearch && matchFamily;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar placa por nombre o MCU (ej. ESP32, ATmega328P)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filterFamily}
            onChange={(e) => setFilterFamily(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
          >
            <option value="all">Todas las familias</option>
            <option value="esp32">ESP32 Series</option>
            <option value="arduino">Arduino (AVR / SAMD)</option>
            <option value="esp8266">ESP8266</option>
            <option value="raspberry_pi_pico">Raspberry Pi Pico (RP2040)</option>
            <option value="stm32">STM32</option>
            <option value="other">Otras</option>
          </select>
        </div>

        <button
          id="btn-new-board"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Placa</span>
        </button>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredBoards.map((board) => {
          const associatedProjects = projects.filter((p) => p.boardId === board.id);

          return (
            <div
              key={board.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm">{board.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        MCU: {board.microcontroller}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(board)}
                      title="Editar placa"
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la placa "${board.name}" de la base de datos?`)) {
                          deleteBoard(board.id);
                        }
                      }}
                      title="Eliminar placa"
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {board.description || 'Sin descripción detallada.'}
                </p>

                {/* Technical specs grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 mb-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tensión Lógica</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {board.operatingVoltage}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Frecuencia CPU</span>
                    <span className="font-mono text-slate-200">{board.clockSpeedMhz} MHz</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Memoria Flash</span>
                    <span className="font-mono text-slate-200">{board.flashMemoryKb} KB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">IO / PWM / ADC</span>
                    <span className="font-mono text-slate-200">
                      {board.digitalPins} / {board.pwmPins} / {board.analogPins}
                    </span>
                  </div>
                </div>

                {/* Connectivity tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {board.hasWifi && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-medium">
                      <Wifi className="w-3 h-3" /> Wi-Fi 802.11 b/g/n
                    </span>
                  )}
                  {board.hasBluetooth && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-medium">
                      <Bluetooth className="w-3 h-3" /> BLE 4.2 / 5.0
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] capitalize">
                    {board.family.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Pinout preview */}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                    Mapeo de Pines Disponibles ({board.pinoutMap.length})
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-slate-950/60 rounded-md border border-slate-800/60">
                    {board.pinoutMap.map((pin, i) => (
                      <span
                        key={i}
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                          pin.includes('GND')
                            ? 'bg-slate-900 border-slate-700 text-slate-400'
                            : pin.includes('V') || pin.includes('VIN')
                            ? 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                            : pin.includes('A')
                            ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
                            : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                        }`}
                      >
                        {pin}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer with project count */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Proyectos activos con esta placa:{' '}
                  <strong className="text-slate-200">{associatedProjects.length}</strong>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {board.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear/Editar Placa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span>{editingBoard ? 'Editar Placa de Desarrollo' : 'Registrar Nueva Placa'}</span>
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
                  Nombre Comercial de la Placa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. ESP32 DevKit V1, Arduino Nano Every, STM32 Blue Pill"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Familia de Arquitectura
                  </label>
                  <select
                    value={formData.family}
                    onChange={(e) =>
                      setFormData({ ...formData, family: e.target.value as BoardFamily })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="esp32">ESP32</option>
                    <option value="arduino">Arduino</option>
                    <option value="esp8266">ESP8266</option>
                    <option value="raspberry_pi_pico">Raspberry Pi Pico</option>
                    <option value="stm32">STM32</option>
                    <option value="other">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Microcontrolador (SoC/MCU)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. ATmega328P, ESP-WROOM-32, RP2040"
                    value={formData.microcontroller}
                    onChange={(e) => setFormData({ ...formData, microcontroller: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Voltaje Lógico
                  </label>
                  <select
                    value={formData.operatingVoltage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operatingVoltage: e.target.value as Board['operatingVoltage']
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="3.3V">3.3V</option>
                    <option value="5V">5V</option>
                    <option value="dual">Dual (3.3V / 5V)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Frecuencia (MHz)
                  </label>
                  <input
                    type="number"
                    value={formData.clockSpeedMhz}
                    onChange={(e) =>
                      setFormData({ ...formData, clockSpeedMhz: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Flash (KB)
                  </label>
                  <input
                    type="number"
                    value={formData.flashMemoryKb}
                    onChange={(e) =>
                      setFormData({ ...formData, flashMemoryKb: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pines Digitales
                  </label>
                  <input
                    type="number"
                    value={formData.digitalPins}
                    onChange={(e) =>
                      setFormData({ ...formData, digitalPins: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pines ADC
                  </label>
                  <input
                    type="number"
                    value={formData.analogPins}
                    onChange={(e) =>
                      setFormData({ ...formData, analogPins: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pines PWM
                  </label>
                  <input
                    type="number"
                    value={formData.pwmPins}
                    onChange={(e) =>
                      setFormData({ ...formData, pwmPins: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasWifi}
                    onChange={(e) => setFormData({ ...formData, hasWifi: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Soporta Wi-Fi</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasBluetooth}
                    onChange={(e) => setFormData({ ...formData, hasBluetooth: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Soporta Bluetooth / BLE</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Lista de Pines (separados por coma para el generador de conexiones) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="D0, D1, D2, D4, A0, 3V3, GND, VIN"
                  value={formData.pinoutMapText}
                  onChange={(e) => setFormData({ ...formData, pinoutMapText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción o Notas
                </label>
                <input
                  type="text"
                  placeholder="ej. Placa robusta con conversor USB-UART CP2102 integrado."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
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
                  {editingBoard ? 'Guardar Cambios' : 'Registrar Placa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
