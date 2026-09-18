import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDatabase } from '../context/DatabaseContext';
import { TestPlan, TestResult } from '../types';

export const TestsView: React.FC = () => {
  const {
    activeProject,
    projectComponents,
    tests,
    testResults,
    createTest,
    updateTest,
    deleteTest,
    addTestResult,
    deleteTestResult,
    currentUser
  } = useDatabase();

  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'results'>('plans');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestPlan | null>(null);

  // Result execution modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedTestForExecution, setSelectedTestForExecution] = useState<TestPlan | null>(null);
  const [resultOutcome, setResultOutcome] = useState('passed' as TestResult['status']);
  const [observedOutcomeText, setObservedOutcomeText] = useState('');
  const [voltageMeasured, setVoltageMeasured] = useState<number | ''>('');
  const [signalVerified, setSignalVerified] = useState(true);
  const [resultNotes, setResultNotes] = useState('');

  // Current project filters
  const currentProjectComps = projectComponents.filter(
    (pc) => pc.projectId === activeProject?.id
  );
  const currentTests = tests.filter((t) => t.projectId === activeProject?.id);
  const currentResults = testResults.filter((tr) => tr.projectId === activeProject?.id);

  // Plan form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetComponentId: '',
    expectedOutcome: '',
    severity: 'medium' as TestPlan['severity']
  });

  const handleOpenCreate = () => {
    setEditingTest(null);
    setFormData({
      title: '',
      description: '',
      targetComponentId: currentProjectComps[0]?.id || '',
      expectedOutcome: '',
      severity: 'medium'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TestPlan) => {
    setEditingTest(t);
    setFormData({
      title: t.title,
      description: t.description,
      targetComponentId: t.targetComponentId || '',
      expectedOutcome: t.expectedOutcome,
      severity: t.severity
    });
    setIsModalOpen(true);
  };

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !formData.title.trim()) return;

    if (editingTest) {
      updateTest(editingTest.id, {
        title: formData.title,
        description: formData.description,
        targetComponentId: formData.targetComponentId || undefined,
        expectedOutcome: formData.expectedOutcome,
        severity: formData.severity
      });
    } else {
      createTest({
        projectId: activeProject.id,
        title: formData.title,
        description: formData.description,
        targetComponentId: formData.targetComponentId || undefined,
        expectedOutcome: formData.expectedOutcome,
        status: 'pending',
        severity: formData.severity
      });
    }
    setIsModalOpen(false);
  };

  const handleOpenExecuteModal = (t: TestPlan) => {
    setSelectedTestForExecution(t);
    setResultOutcome('passed');
    setObservedOutcomeText(t.expectedOutcome || 'Comportamiento observado dentro de parámetros nominales.');
    setVoltageMeasured(3.3);
    setSignalVerified(true);
    setResultNotes('');
    setIsResultModalOpen(true);
  };

  const handleSubmitResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !selectedTestForExecution) return;

    addTestResult({
      testId: selectedTestForExecution.id,
      projectId: activeProject.id,
      executedBy: currentUser?.displayName || 'Ingeniero MicroLab',
      status: resultOutcome,
      observedOutcome: observedOutcomeText,
      voltageMeasured: voltageMeasured === '' ? undefined : Number(voltageMeasured),
      signalVerified,
      notes: resultNotes,
      durationMs: Math.round(1500 + Math.random() * 4000)
    });

    if (resultOutcome === 'passed') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {
        // ignore
      }
    }

    setIsResultModalOpen(false);
    setActiveSubTab('results');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeSubTab === 'plans'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Planes de Prueba ({currentTests.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('results')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeSubTab === 'results'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Resultados Registrados ({currentResults.length})</span>
          </button>
        </div>

        {activeSubTab === 'plans' && (
          <button
            id="btn-new-test"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Plan de Prueba</span>
          </button>
        )}
      </div>

      {/* Tab: Plans */}
      {activeSubTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentTests.map((test) => {
            const targetComp = projectComponents.find((pc) => pc.id === test.targetComponentId);

            return (
              <div
                key={test.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                          test.status === 'passed'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                            : test.status === 'failed'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/20'
                            : test.status === 'in_progress'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {test.status}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          test.severity === 'critical'
                            ? 'bg-rose-950 text-rose-400'
                            : test.severity === 'high'
                            ? 'bg-orange-950 text-orange-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {test.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(test)}
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        title="Editar prueba"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la prueba "${test.title}"?`)) {
                            deleteTest(test.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Eliminar prueba"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-100 text-sm mt-1 mb-2">{test.title}</h4>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {test.description}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2 mb-4 text-xs">
                    {targetComp && (
                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-400">Objetivo:</span>{' '}
                        <strong className="text-emerald-400 font-normal">
                          {targetComp.customLabel}
                        </strong>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Criterio de Aceptación Esperado:
                      </span>
                      <p className="text-[11px] text-slate-300 italic">{test.expectedOutcome}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {test.id}</span>
                  <button
                    onClick={() => handleOpenExecuteModal(test)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold transition-all shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Ejecutar Prueba</span>
                  </button>
                </div>
              </div>
            );
          })}

          {currentTests.length === 0 && (
            <div className="col-span-full p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <CheckSquare className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">
                No hay planes de prueba en este proyecto
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Registra pruebas funcionales para validar tensiones, sensores o respuesta de buses.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Results */}
      {activeSubTab === 'results' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Prueba de Origen</th>
                    <th className="py-3 px-4">Resultado Observado</th>
                    <th className="py-3 px-4">Tensión</th>
                    <th className="py-3 px-4">Señal</th>
                    <th className="py-3 px-4">Ejecutado Por</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentResults.map((res) => {
                    const testPlan = tests.find((t) => t.id === res.testId);

                    return (
                      <tr key={res.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              res.status === 'passed'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                                : res.status === 'failed'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {res.status === 'passed' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-400" />
                            )}
                            {res.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200 max-w-xs">
                          {testPlan?.title || res.testId}
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-sm">
                          {res.observedOutcome}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {res.voltageMeasured ? `${res.voltageMeasured}V` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              res.signalVerified
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {res.signalVerified ? 'OK' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {res.executedBy}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[10px] font-mono">
                          {new Date(res.executedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteTestResult(res.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Eliminar resultado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {currentResults.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay resultados de pruebas grabados aún. Ejecuta una prueba desde la pestaña anterior.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Plan de Prueba */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>{editingTest ? 'Modificar Plan de Prueba' : 'Definir Nuevo Plan de Prueba'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Título de la Prueba *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Medición de voltaje sensor analógico, Test I2C ACK"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Componente Relacionado
                  </label>
                  <select
                    value={formData.targetComponentId}
                    onChange={(e) =>
                      setFormData({ ...formData, targetComponentId: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="">(Toda la placa / General)</option>
                    {currentProjectComps.map((pc) => (
                      <option key={pc.id} value={pc.id}>
                        {pc.customLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nivel de Severidad
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        severity: e.target.value as TestPlan['severity']
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del Procedimiento
                </label>
                <textarea
                  rows={2}
                  placeholder="Pasos a ejecutar con multímetro u osciloscopio..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Resultado Esperado / Condición de Aprobación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Tensión nominal 3.3V ± 0.1V, sin fluctuaciones."
                  value={formData.expectedOutcome}
                  onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
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
                  {editingTest ? 'Guardar Cambios' : 'Registrar Plan en Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Ejecución de Prueba */}
      {isResultModalOpen && selectedTestForExecution && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-1 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Registrar Resultado de Prueba</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Prueba: <strong className="text-slate-200">{selectedTestForExecution.title}</strong>
            </p>

            <form onSubmit={handleSubmitResult} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dictamen / Estado Final
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResultOutcome('passed')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                      resultOutcome === 'passed'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprobada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultOutcome('failed')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                      resultOutcome === 'failed'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Fallida</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultOutcome('inconclusive')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                      resultOutcome === 'inconclusive'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Dudosa</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Comportamiento Observado *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detalle exacto de lo medido o visualizado..."
                  value={observedOutcomeText}
                  onChange={(e) => setObservedOutcomeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Voltaje Medido (V)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="ej. 3.31, 5.02"
                    value={voltageMeasured}
                    onChange={(e) =>
                      setVoltageMeasured(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={signalVerified}
                      onChange={(e) => setSignalVerified(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Señal / Protocolo OK</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  Grabar en testResults
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
