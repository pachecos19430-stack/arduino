import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  RefreshCw,
  Cpu,
  Gauge,
  Thermometer,
  Zap,
  TrendingUp,
  Radio,
  Sliders
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const MonitoringView: React.FC = () => {
  const {
    activeProject,
    boards,
    telemetry,
    generateSimulatedTelemetryBatch,
    addLog
  } = useDatabase();

  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [selectedMetricFilter, setSelectedMetricFilter] = useState<string>('all');

  // Filter telemetry by active project
  const projectTelemetry = telemetry.filter((t) => t.projectId === activeProject?.id);
  const board = boards.find((b) => b.id === activeProject?.boardId);

  // Auto generator ticker
  useEffect(() => {
    let interval: any = null;
    if (isAutoSimulating && activeProject) {
      interval = setInterval(() => {
        generateSimulatedTelemetryBatch(activeProject.id);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSimulating, activeProject]);

  // Latest metrics extraction
  const getLatestMetric = (metric: string) => {
    return projectTelemetry.find((t) => t.metric === metric);
  };

  const latestTemp = getLatestMetric('temperature');
  const latestHum = getLatestMetric('humidity');
  const latestHeap = getLatestMetric('free_heap');
  const latestFreq = getLatestMetric('loop_frequency_hz');

  const filteredTelemetry =
    selectedMetricFilter === 'all'
      ? projectTelemetry
      : projectTelemetry.filter((t) => t.metric === selectedMetricFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Consola de Monitoreo & Telemetría</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Colección: telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Estructura preparada para la fase 2 (sensores reales de Arduino y ESP32). En esta etapa, el motor de telemetría de MicroLab almacena y renderiza datos simulados de instrumentación en Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeProject && (
            <button
              id="btn-trigger-telemetry"
              onClick={() => generateSimulatedTelemetryBatch(activeProject.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muestrear Ahora</span>
            </button>
          )}

          <button
            id="btn-toggle-autosim"
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isAutoSimulating
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isAutoSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar Simulación</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Simular Flujo Vivo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Gauges / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Temperatura Sensor</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {latestTemp ? latestTemp.value : '24.2'}
              </span>
              <span className="text-xs text-slate-400">°C</span>
            </div>
            <span className="text-[10px] text-slate-400">Objetivo: DHT22 / AM2302</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Thermometer className="w-6 h-6" />
          </div>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Humedad Relativa</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {latestHum ? latestHum.value : '52.0'}
              </span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            <span className="text-[10px] text-slate-400">Humedad ambiental</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Gauge className="w-6 h-6" />
          </div>
        </div>

        {/* Free Heap */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Memoria SRAM Libre</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-indigo-400">
                {latestHeap ? latestHeap.value : '182.4'}
              </span>
              <span className="text-xs text-slate-400">KB</span>
            </div>
            <span className="text-[10px] text-slate-400">{board?.microcontroller || 'ESP32'}</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Loop Frequency */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Frecuencia de Ciclo</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {latestFreq ? latestFreq.value : '100'}
              </span>
              <span className="text-xs text-slate-400">Hz</span>
            </div>
            <span className="text-[10px] text-slate-400">void loop() rate</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Radio className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Telemetry Log Stream */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-200">
              Registro de Puntos de Telemetría ({filteredTelemetry.length})
            </h4>
            {isAutoSimulating && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Transmitiendo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Métrica:</span>
            <select
              value={selectedMetricFilter}
              onChange={(e) => setSelectedMetricFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-hidden"
            >
              <option value="all">Todas las métricas</option>
              <option value="temperature">Temperatura (°C)</option>
              <option value="humidity">Humedad (%)</option>
              <option value="free_heap">Memoria Heap (KB)</option>
              <option value="loop_frequency_hz">Frecuencia Loop (Hz)</option>
            </select>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Marca Temporal</th>
                <th className="py-2.5 px-4">Métrica</th>
                <th className="py-2.5 px-4">Valor</th>
                <th className="py-2.5 px-4">Unidad</th>
                <th className="py-2.5 px-4">Origen</th>
                <th className="py-2.5 px-4 font-mono">ID Firestore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredTelemetry.slice(0, 50).map((t) => (
                <tr key={t.id} className="hover:bg-slate-850/50">
                  <td className="py-2 px-4 text-slate-400">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-4 text-slate-200 uppercase font-sans font-medium text-xs">
                    {t.metric}
                  </td>
                  <td className="py-2 px-4 text-emerald-400 font-bold">{t.value}</td>
                  <td className="py-2 px-4 text-slate-400">{t.unit}</td>
                  <td className="py-2 px-4">
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 font-sans">
                      {t.simulated ? 'Simulador MicroLab' : 'Hardware Directo'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-slate-400 text-[10px]">{t.id}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTelemetry.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay telemetría registrada para este proyecto. Presiona "Muestrear Ahora" o "Simular Flujo Vivo".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
