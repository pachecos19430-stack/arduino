import React, { useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { Sidebar, SectionType } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectsView } from './components/ProjectsView';
import { HardwareView } from './components/HardwareView';
import { ComponentsView } from './components/ComponentsView';
import { ConnectionsView } from './components/ConnectionsView';
import { TestsView } from './components/TestsView';
import { MonitoringView } from './components/MonitoringView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { HistoryLogsView } from './components/HistoryLogsView';
import { SettingsView } from './components/SettingsView';

const SECTION_TITLES: Record<SectionType, string> = {
  projects: 'Proyectos MicroLab',
  hardware: 'Hardware & Placas de Desarrollo',
  components: 'Componentes, Sensores & Actuadores',
  connections: 'Conexiones & Matriz de Pines',
  tests: 'Planes de Prueba & Resultados',
  monitoring: 'Monitoreo & Telemetría',
  diagnostics: 'Diagnóstico & Análisis de Circuito',
  history: 'Historial & Registro de Eventos',
  settings: 'Configuración & Enlace Firebase'
};

function MainAppContent() {
  const [currentSection, setCurrentSection] = useState<SectionType>('projects');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Header bar */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentSectionTitle={SECTION_TITLES[currentSection]}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'projects' && <ProjectsView />}
          {currentSection === 'hardware' && <HardwareView />}
          {currentSection === 'components' && <ComponentsView />}
          {currentSection === 'connections' && <ConnectionsView />}
          {currentSection === 'tests' && <TestsView />}
          {currentSection === 'monitoring' && <MonitoringView />}
          {currentSection === 'diagnostics' && <DiagnosticsView />}
          {currentSection === 'history' && <HistoryLogsView />}
          {currentSection === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <MainAppContent />
    </DatabaseProvider>
  );
}
