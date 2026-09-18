import React, { useState } from 'react';
import {
  Settings,
  Database,
  Flame,
  Shield,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  Layers,
  Server,
  Key
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const SettingsView: React.FC = () => {
  const {
    isFirebaseLive,
    firebaseProjectId,
    firestoreDatabaseId,
    syncStatus,
    currentUser,
    projects,
    boards,
    components,
    projectComponents,
    connections,
    tests,
    testResults,
    telemetry,
    logs,
    seedFirestoreDefaults,
    exportDatabaseJSON,
    resetDatabaseToDefault
  } = useDatabase();

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSeedCloudDatabase = async () => {
    setSeeding(true);
    try {
      await seedFirestoreDefaults();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    } finally {
      setSeeding(false);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microlab_firestore_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const collectionsMeta = [
    { name: 'users', count: currentUser ? 1 : 0, desc: 'Perfiles de ingenieros y makers' },
    { name: 'boards', count: boards.length, desc: 'Placas Arduino, ESP32, STM32' },
    { name: 'components', count: components.length, desc: 'Catálogo de sensores y actuadores' },
    { name: 'projects', count: projects.length, desc: 'Proyectos de hardware registrados' },
    { name: 'projectComponents', count: projectComponents.length, desc: 'Instancias de componentes por circuito' },
    { name: 'connections', count: connections.length, desc: 'Cableado y asignación de pines' },
    { name: 'tests', count: tests.length, desc: 'Planes de pruebas de validación' },
    { name: 'testResults', count: testResults.length, desc: 'Mediciones y resultados de prueba' },
    { name: 'telemetry', count: telemetry.length, desc: 'Muestras de telemetría y sensores' },
    { name: 'logs', count: logs.length, desc: 'Registro de auditoría del sistema' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-slate-100">
            Configuración de MicroLab & Firebase Firestore
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Administración de la persistencia de las 10 colecciones en Firebase Firestore, estado de enlace de Authentication y herramientas de sincronización y respaldo.
        </p>
      </div>

      {/* Database Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Firebase Firestore Conectado</h4>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-300 font-medium">
                {isFirebaseLive ? 'Enlace Directo Activo' : 'Conectando...'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              ID: {firebaseProjectId}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Base de Datos Firestore</h4>
            <p className="text-[11px] font-mono text-cyan-400 mt-1 break-all">
              {firestoreDatabaseId}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Base de datos dedicada en la nube (Google Cloud)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Seguridad & Firestore Rules</h4>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-slate-300">Reglas Desplegadas</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              10 colecciones blindadas con validación estricta
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Synchronization & Seeding */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CloudUpload className="w-4 h-4 text-emerald-400" />
              <span>Sincronización de Datos Iniciales en Firestore</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Carga el catálogo predeterminado de microcontroladores (Arduino Uno, ESP32, Pico, etc.) y sensores a tu base de datos de Firestore.
            </p>
          </div>

          <button
            id="btn-seed-firestore"
            onClick={handleSeedCloudDatabase}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors shadow-xs shrink-0"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{seeding ? 'Sincronizando...' : 'Poblar Catálogo en Firestore'}</span>
          </button>
        </div>

        {seedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>¡Datos sincronizados exitosamente en las colecciones de Firestore!</span>
          </div>
        )}

        {/* Collections Breakdown */}
        <div>
          <h5 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Colecciones y Documentos Almacenados:</span>
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {collectionsMeta.map((col) => (
              <div
                key={col.name}
                className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-xs font-semibold text-emerald-400 truncate">
                    /{col.name}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {col.desc}
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {col.count} docs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backup and Maintenance Section */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Mantenimiento & Respaldos</span>
        </h4>
        <p className="text-xs text-slate-400">
          Descarga una copia completa en formato JSON de todas las colecciones de Firestore o restaura el estado a los valores base.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            id="btn-download-backup"
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Descargar Backup JSON</span>
          </button>

          <button
            id="btn-reset-default"
            onClick={() => {
              if (confirm('¿Estás seguro de que deseas reiniciar los datos locales de MicroLab?')) {
                resetDatabaseToDefault();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 text-xs font-medium border border-amber-900/40 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Valores Iniciales</span>
          </button>
        </div>
      </div>
    </div>
  );
};
