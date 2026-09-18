import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Cpu,
  Zap,
  Layers,
  Sparkles,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const DiagnosticsView: React.FC = () => {
  const {
    activeProject,
    boards,
    components,
    projectComponents,
    connections,
    tests,
    testResults
  } = useDatabase();

  const [isScanning, setIsScanning] = useState(false);

  const currentBoard = boards.find((b) => b.id === activeProject?.boardId);
  const currentComps = projectComponents.filter((pc) => pc.projectId === activeProject?.id);
  const currentConns = connections.filter((c) => c.projectId === activeProject?.id);
  const currentTests = tests.filter((t) => t.projectId === activeProject?.id);
  const currentResults = testResults.filter((tr) => tr.projectId === activeProject?.id);

  // Run dynamic verification rules
  const diagnostics: {
    id: string;
    level: 'ok' | 'warning' | 'danger' | 'info';
    title: string;
    description: string;
    recommendation: string;
  }[] = [];

  // Rule 1: Board assignment
  if (!currentBoard) {
    diagnostics.push({
      id: 'd_no_board',
      level: 'danger',
      title: 'Proyecto sin placa de desarrollo vinculada',
      description: 'El proyecto no tiene ningún microcontrolador asignado en la colección `projects`.',
      recommendation: 'Edita el proyecto y selecciona una placa (ESP32 o Arduino) para validar niveles lógicos.'
    });
  } else {
    diagnostics.push({
      id: 'd_board_ok',
      level: 'ok',
      title: `Placa ${currentBoard.name} vinculada correctamente`,
      description: `Arquitectura ${currentBoard.family.toUpperCase()} con lógica de ${currentBoard.operatingVoltage}.`,
      recommendation: 'Verifica no aplicar tensiones mayores a las admitidas por el convertidor ADC.'
    });
  }

  // Rule 2: Voltage conflicts (e.g. 5V sensor on 3.3V board without level shifter)
  if (currentBoard && currentBoard.operatingVoltage === '3.3V') {
    const dangerousComps = currentComps.filter((pc) => {
      const cat = components.find((c) => c.id === pc.componentCatalogId);
      return cat?.operatingVoltage.includes('5V') && !cat?.operatingVoltage.includes('3.3V');
    });

    if (dangerousComps.length > 0) {
      diagnostics.push({
        id: 'd_voltage_mismatch',
        level: 'warning',
        title: 'Posible discrepancia de nivel lógico (3.3V vs 5V)',
        description: `Se detectaron ${dangerousComps.length} componente(s) que operan nominalmente a 5V conectados a una placa de 3.3V.`,
        recommendation: 'Usa un convertidor de nivel lógico bidireccional I2C/UART para proteger las entradas GPIO de tu ESP32.'
      });
    }
  }

  // Rule 3: Unconnected components
  const unmappedComps = currentComps.filter((pc) => {
    return !currentConns.some((c) => c.projectComponentId === pc.id);
  });

  if (unmappedComps.length > 0) {
    diagnostics.push({
      id: 'd_unmapped_components',
      level: 'warning',
      title: `${unmappedComps.length} componente(s) sin cableado asignado`,
      description: 'Los componentes están en la lista del proyecto pero no tienen pines conectados a la placa en `connections`.',
      recommendation: 'Dirígete a la sección "Conexiones & Pines" y asigna los pines VCC, GND y de señal.'
    });
  } else if (currentComps.length > 0) {
    diagnostics.push({
      id: 'd_all_mapped',
      level: 'ok',
      title: 'Todos los componentes tienen conexiones registradas',
      description: `${currentConns.length} pines conectados en total para este proyecto.`,
      recommendation: 'Mantén los cables cortos para evitar ruido electromagnético en buses I2C o SPI.'
    });
  }

  // Rule 4: Duplicate pin assignment
  const pinCounts: { [pin: string]: number } = {};
  currentConns.forEach((c) => {
    // GND and VCC can share pins via breadboard rails
    if (!c.boardPin.includes('GND') && !c.boardPin.includes('3V3') && !c.boardPin.includes('5V')) {
      pinCounts[c.boardPin] = (pinCounts[c.boardPin] || 0) + 1;
    }
  });

  const duplicatePins = Object.keys(pinCounts).filter((pin) => pinCounts[pin] > 1);
  if (duplicatePins.length > 0) {
    diagnostics.push({
      id: 'd_pin_collision',
      level: 'danger',
      title: `Conflicto de asignación: Pines compartidos (${duplicatePins.join(', ')})`,
      description: 'Dos o más señales están conectadas al mismo pin GPIO simultáneamente.',
      recommendation: 'A menos que sea un bus compartido como I2C (SDA/SCL), reasigna uno de los componentes a otro pin disponible.'
    });
  }

  // Rule 5: Test coverage
  if (currentTests.length === 0) {
    diagnostics.push({
      id: 'd_no_tests',
      level: 'info',
      title: 'Sin planes de prueba definidos',
      description: 'El proyecto no cuenta con rutinas de verificación ni mediciones guardadas en Firestore.',
      recommendation: 'Crea una prueba básica de encendido o lectura para certificar el prototipo.'
    });
  } else {
    const passedCount = currentResults.filter((r) => r.status === 'passed').length;
    diagnostics.push({
      id: 'd_test_coverage',
      level: 'ok',
      title: `Cobertura de Pruebas: ${currentTests.length} planes registrados`,
      description: `${passedCount} resultado(s) aprobados registrados en Firestore.`,
      recommendation: 'Continúa registrando resultados tras cada modificación de circuito.'
    });
  }

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
              <span>Diagnóstico Automático de Hardware y Circuitería</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Motor de Reglas MicroLab
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Analiza colisiones de pines, compatibilidad de voltajes entre Arduino/ESP32 y sensores, y estado de pruebas funcionales antes del conexionado real.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Escaneando...' : 'Re-evaluar Circuito'}</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Total Reglas Evaluadas</span>
          <span className="text-2xl font-bold font-mono text-slate-100">{diagnostics.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Correctos (OK)</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {diagnostics.filter((d) => d.level === 'ok').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Advertencias</span>
          <span className="text-2xl font-bold font-mono text-amber-400">
            {diagnostics.filter((d) => d.level === 'warning').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Críticos / Errores</span>
          <span className="text-2xl font-bold font-mono text-rose-400">
            {diagnostics.filter((d) => d.level === 'danger').length}
          </span>
        </div>
      </div>

      {/* Diagnostics Cards */}
      <div className="space-y-3">
        {diagnostics.map((diag) => {
          return (
            <div
              key={diag.id}
              className={`p-4 rounded-xl border transition-all ${
                diag.level === 'ok'
                  ? 'bg-slate-900/40 border-emerald-900/30'
                  : diag.level === 'warning'
                  ? 'bg-amber-950/20 border-amber-800/40'
                  : diag.level === 'danger'
                  ? 'bg-rose-950/20 border-rose-800/40'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {diag.level === 'ok' && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {diag.level === 'warning' && (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  {diag.level === 'danger' && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  {diag.level === 'info' && (
                    <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-200">{diag.title}</h4>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                        diag.level === 'ok'
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : diag.level === 'warning'
                          ? 'text-amber-400 bg-amber-950/60'
                          : diag.level === 'danger'
                          ? 'text-rose-400 bg-rose-950/60'
                          : 'text-cyan-400 bg-cyan-950/60'
                      }`}
                    >
                      {diag.level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {diag.description}
                  </p>

                  <div className="mt-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                    <span className="font-semibold text-slate-300 shrink-0">Recomendación Maker:</span>
                    <span>{diag.recommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
