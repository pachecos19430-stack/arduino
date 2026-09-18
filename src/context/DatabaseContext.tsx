import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import {
  UserProfile,
  Board,
  ComponentCatalogItem,
  Project,
  ProjectComponent,
  Connection,
  TestPlan,
  TestResult,
  TelemetryDataPoint,
  SystemLog
} from '../types';
import {
  INITIAL_USER,
  INITIAL_BOARDS,
  INITIAL_COMPONENTS,
  INITIAL_PROJECTS,
  INITIAL_PROJECT_COMPONENTS,
  INITIAL_CONNECTIONS,
  INITIAL_TESTS,
  INITIAL_TEST_RESULTS,
  INITIAL_TELEMETRY,
  INITIAL_LOGS
} from '../data/mockData';
import {
  db,
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  signOutUser as fbSignOutUser,
  onAuthStateChanged,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from '../services/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface DatabaseContextType {
  // Auth state
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loginUser: (email: string, name?: string) => void;
  signInWithGoogle: () => Promise<void>;
  logoutUser: () => void;

  // Active Project Selection
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeProject: Project | null;

  // Collections (Firestore schema)
  projects: Project[];
  boards: Board[];
  components: ComponentCatalogItem[];
  projectComponents: ProjectComponent[];
  connections: Connection[];
  tests: TestPlan[];
  testResults: TestResult[];
  telemetry: TelemetryDataPoint[];
  logs: SystemLog[];

  // CRUD for Projects
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // CRUD for Boards
  createBoard: (board: Omit<Board, 'id' | 'createdAt'>) => Promise<Board>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;

  // CRUD for Components (Catalog)
  createComponent: (component: Omit<ComponentCatalogItem, 'id' | 'createdAt'>) => Promise<ComponentCatalogItem>;
  updateComponent: (id: string, updates: Partial<ComponentCatalogItem>) => Promise<void>;
  deleteComponent: (id: string) => Promise<void>;

  // CRUD for Project Components
  addProjectComponent: (item: Omit<ProjectComponent, 'id' | 'addedAt'>) => Promise<ProjectComponent>;
  updateProjectComponent: (id: string, updates: Partial<ProjectComponent>) => Promise<void>;
  removeProjectComponent: (id: string) => Promise<void>;

  // CRUD for Connections
  createConnection: (conn: Omit<Connection, 'id' | 'createdAt'>) => Promise<Connection>;
  updateConnection: (id: string, updates: Partial<Connection>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;

  // CRUD for Tests
  createTest: (test: Omit<TestPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TestPlan>;
  updateTest: (id: string, updates: Partial<TestPlan>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;

  // CRUD for Test Results
  addTestResult: (result: Omit<TestResult, 'id' | 'executedAt'>) => Promise<TestResult>;
  deleteTestResult: (id: string) => Promise<void>;

  // Telemetry & Logs operations
  addTelemetryPoint: (point: Omit<TelemetryDataPoint, 'id' | 'timestamp'>) => Promise<TelemetryDataPoint>;
  generateSimulatedTelemetryBatch: (projectId: string) => void;
  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => Promise<void>;
  clearLogs: () => void;

  // Firebase integration status
  isFirebaseLive: boolean;
  firebaseProjectId: string;
  firestoreDatabaseId: string;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  seedFirestoreDefaults: () => Promise<void>;
  exportDatabaseJSON: () => string;
  resetDatabaseToDefault: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'microlab_v1_';

function loadOrInit<T>(key: string, defaultVal: T): T {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Could not parse storage for ${key}`, e);
  }
  return defaultVal;
}

function persist<T>(key: string, value: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    loadOrInit('user', INITIAL_USER)
  );

  // Firestore collections states
  const [projects, setProjects] = useState<Project[]>(() =>
    loadOrInit('projects', INITIAL_PROJECTS)
  );
  const [boards, setBoards] = useState<Board[]>(() =>
    loadOrInit('boards', INITIAL_BOARDS)
  );
  const [components, setComponents] = useState<ComponentCatalogItem[]>(() =>
    loadOrInit('components', INITIAL_COMPONENTS)
  );
  const [projectComponents, setProjectComponents] = useState<ProjectComponent[]>(() =>
    loadOrInit('projectComponents', INITIAL_PROJECT_COMPONENTS)
  );
  const [connections, setConnections] = useState<Connection[]>(() =>
    loadOrInit('connections', INITIAL_CONNECTIONS)
  );
  const [tests, setTests] = useState<TestPlan[]>(() =>
    loadOrInit('tests', INITIAL_TESTS)
  );
  const [testResults, setTestResults] = useState<TestResult[]>(() =>
    loadOrInit('testResults', INITIAL_TEST_RESULTS)
  );
  const [telemetry, setTelemetry] = useState<TelemetryDataPoint[]>(() =>
    loadOrInit('telemetry', INITIAL_TELEMETRY)
  );
  const [logs, setLogs] = useState<SystemLog[]>(() =>
    loadOrInit('logs', INITIAL_LOGS)
  );

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'activeProjectId');
    if (saved) return saved;
    return INITIAL_PROJECTS[0]?.id || null;
  });

  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  // Persistence to local storage for offline resilience
  useEffect(() => persist('user', currentUser), [currentUser]);
  useEffect(() => persist('projects', projects), [projects]);
  useEffect(() => persist('boards', boards), [boards]);
  useEffect(() => persist('components', components), [components]);
  useEffect(() => persist('projectComponents', projectComponents), [projectComponents]);
  useEffect(() => persist('connections', connections), [connections]);
  useEffect(() => persist('tests', tests), [tests]);
  useEffect(() => persist('testResults', testResults), [testResults]);
  useEffect(() => persist('telemetry', telemetry), [telemetry]);
  useEffect(() => persist('logs', logs), [logs]);
  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'activeProjectId', activeProjectId);
    }
  }, [activeProjectId]);

  // Check Firestore connection on startup
  useEffect(() => {
    testFirestoreConnection().then((ok) => {
      setIsFirebaseLive(ok);
      setSyncStatus(ok ? 'synced' : 'offline');
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userProfile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || 'maker@microlab.io',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Maker MicroLab',
          photoURL: fbUser.photoURL || undefined,
          role: 'maker',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(userProfile);

        // Sync user doc to Firestore /users/{uid}
        try {
          await setDoc(doc(db, 'users', fbUser.uid), userProfile, { merge: true });
        } catch (err) {
          console.warn('Could not save user profile to Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Setup Firestore real-time onSnapshot listeners
  useEffect(() => {
    // 1. Boards
    const unsubBoards = onSnapshot(
      collection(db, 'boards'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Board[] = [];
          snapshot.forEach((d) => items.push(d.data() as Board));
          setBoards(items);
        }
      },
      (error) => {
        console.warn('Boards onSnapshot warning:', error.message);
      }
    );

    // 2. Components
    const unsubComponents = onSnapshot(
      collection(db, 'components'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ComponentCatalogItem[] = [];
          snapshot.forEach((d) => items.push(d.data() as ComponentCatalogItem));
          setComponents(items);
        }
      },
      (error) => {
        console.warn('Components onSnapshot warning:', error.message);
      }
    );

    // 3. Projects
    const unsubProjects = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Project[] = [];
          snapshot.forEach((d) => items.push(d.data() as Project));
          setProjects(items);
        }
      },
      (error) => {
        console.warn('Projects onSnapshot warning:', error.message);
      }
    );

    // 4. Project Components
    const unsubProjectComponents = onSnapshot(
      collection(db, 'projectComponents'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ProjectComponent[] = [];
          snapshot.forEach((d) => items.push(d.data() as ProjectComponent));
          setProjectComponents(items);
        }
      },
      (error) => {
        console.warn('ProjectComponents onSnapshot warning:', error.message);
      }
    );

    // 5. Connections
    const unsubConnections = onSnapshot(
      collection(db, 'connections'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Connection[] = [];
          snapshot.forEach((d) => items.push(d.data() as Connection));
          setConnections(items);
        }
      },
      (error) => {
        console.warn('Connections onSnapshot warning:', error.message);
      }
    );

    // 6. Tests
    const unsubTests = onSnapshot(
      collection(db, 'tests'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: TestPlan[] = [];
          snapshot.forEach((d) => items.push(d.data() as TestPlan));
          setTests(items);
        }
      },
      (error) => {
        console.warn('Tests onSnapshot warning:', error.message);
      }
    );

    // 7. Test Results
    const unsubTestResults = onSnapshot(
      collection(db, 'testResults'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: TestResult[] = [];
          snapshot.forEach((d) => items.push(d.data() as TestResult));
          setTestResults(items);
        }
      },
      (error) => {
        console.warn('TestResults onSnapshot warning:', error.message);
      }
    );

    // 8. Telemetry
    const unsubTelemetry = onSnapshot(
      collection(db, 'telemetry'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: TelemetryDataPoint[] = [];
          snapshot.forEach((d) => items.push(d.data() as TelemetryDataPoint));
          setTelemetry(items);
        }
      },
      (error) => {
        console.warn('Telemetry onSnapshot warning:', error.message);
      }
    );

    // 9. Logs
    const unsubLogs = onSnapshot(
      collection(db, 'logs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: SystemLog[] = [];
          snapshot.forEach((d) => items.push(d.data() as SystemLog));
          setLogs(items);
        }
      },
      (error) => {
        console.warn('Logs onSnapshot warning:', error.message);
      }
    );

    return () => {
      unsubBoards();
      unsubComponents();
      unsubProjects();
      unsubProjectComponents();
      unsubConnections();
      unsubTests();
      unsubTestResults();
      unsubTelemetry();
      unsubLogs();
    };
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Function to seed default catalog data into Firestore
  const seedFirestoreDefaults = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      // Seed boards
      for (const b of INITIAL_BOARDS) {
        await setDoc(doc(db, 'boards', b.id), b, { merge: true });
      }
      // Seed components
      for (const c of INITIAL_COMPONENTS) {
        await setDoc(doc(db, 'components', c.id), c, { merge: true });
      }
      // Seed sample projects
      for (const p of INITIAL_PROJECTS) {
        await setDoc(doc(db, 'projects', p.id), p, { merge: true });
      }
      // Seed sample project components
      for (const pc of INITIAL_PROJECT_COMPONENTS) {
        await setDoc(doc(db, 'projectComponents', pc.id), pc, { merge: true });
      }
      // Seed sample connections
      for (const conn of INITIAL_CONNECTIONS) {
        await setDoc(doc(db, 'connections', conn.id), conn, { merge: true });
      }
      // Seed tests
      for (const t of INITIAL_TESTS) {
        await setDoc(doc(db, 'tests', t.id), t, { merge: true });
      }
      // Seed test results
      for (const tr of INITIAL_TEST_RESULTS) {
        await setDoc(doc(db, 'testResults', tr.id), tr, { merge: true });
      }
      // Seed telemetry
      for (const tel of INITIAL_TELEMETRY) {
        await setDoc(doc(db, 'telemetry', tel.id), tel, { merge: true });
      }
      // Seed logs
      for (const l of INITIAL_LOGS) {
        await setDoc(doc(db, 'logs', l.id), l, { merge: true });
      }
      setSyncStatus('synced');
    } catch (e) {
      console.error('Error seeding defaults into Firestore:', e);
      setSyncStatus('error');
    }
  }, []);

  // Auth methods
  const loginUser = (email: string, name?: string) => {
    const user: UserProfile = {
      id: 'usr_' + Date.now().toString(36),
      email,
      displayName: name || email.split('@')[0],
      role: 'maker',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(user);
    addLog({
      level: 'info',
      module: 'system',
      message: `Sesión iniciada por ${user.displayName} (${user.email})`
    });
  };

  const signInWithGoogle = async () => {
    try {
      await fbSignInWithGoogle();
    } catch (e) {
      console.error('Sign-in error:', e);
    }
  };

  const logoutUser = async () => {
    try {
      await fbSignOutUser();
    } catch {
      // ignore
    }
    if (currentUser) {
      addLog({
        level: 'info',
        module: 'system',
        message: `Sesión cerrada para ${currentUser.email}`
      });
    }
    setCurrentUser(null);
  };

  // CRUD Projects
  const createProject = async (
    item: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ): Promise<Project> => {
    const now = new Date().toISOString();
    const newPrj: Project = {
      ...item,
      id: 'prj_' + Date.now().toString(36),
      userId: auth.currentUser?.uid || currentUser?.id || 'usr_guest',
      createdAt: now,
      updatedAt: now
    };

    // Optimistic UI
    setProjects((prev) => [newPrj, ...prev]);
    setActiveProjectId(newPrj.id);

    try {
      await setDoc(doc(db, 'projects', newPrj.id), newPrj);
    } catch (error) {
      console.warn('Firestore createProject fallback to local:', error);
    }

    addLog({
      projectId: newPrj.id,
      level: 'info',
      module: 'system',
      message: `Proyecto creado: "${newPrj.name}" con placa ${newPrj.boardId}`
    });

    return newPrj;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );

    try {
      await updateDoc(doc(db, 'projects', id), { ...updates, updatedAt: now });
    } catch (error) {
      console.warn('Firestore updateProject fallback to local:', error);
    }

    addLog({
      projectId: id,
      level: 'info',
      module: 'system',
      message: `Proyecto modificado (ID: ${id})`
    });
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setProjectComponents((prev) => prev.filter((pc) => pc.projectId !== id));
    setConnections((prev) => prev.filter((c) => c.projectId !== id));
    setTests((prev) => prev.filter((t) => t.projectId !== id));
    setTestResults((prev) => prev.filter((tr) => tr.projectId !== id));
    setTelemetry((prev) => prev.filter((tel) => tel.projectId !== id));

    if (activeProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id);
      setActiveProjectId(remaining[0]?.id || null);
    }

    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.warn('Firestore deleteProject fallback to local:', error);
    }

    addLog({
      level: 'warn',
      module: 'system',
      message: `Proyecto eliminado (ID: ${id}) con todos sus componentes y conexiones vinculadas.`
    });
  };

  // CRUD Boards
  const createBoard = async (board: Omit<Board, 'id' | 'createdAt'>): Promise<Board> => {
    const newBoard: Board = {
      ...board,
      id: 'brd_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    setBoards((prev) => [...prev, newBoard]);

    try {
      await setDoc(doc(db, 'boards', newBoard.id), newBoard);
    } catch (error) {
      console.warn('Firestore createBoard fallback to local:', error);
    }

    addLog({
      level: 'info',
      module: 'hardware',
      message: `Nueva placa registrada: "${newBoard.name}" (${newBoard.microcontroller})`
    });
    return newBoard;
  };

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    try {
      await updateDoc(doc(db, 'boards', id), updates);
    } catch (error) {
      console.warn('Firestore updateBoard fallback to local:', error);
    }

    addLog({
      level: 'info',
      module: 'hardware',
      message: `Placa de desarrollo actualizada (ID: ${id})`
    });
  };

  const deleteBoard = async (id: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'boards', id));
    } catch (error) {
      console.warn('Firestore deleteBoard fallback to local:', error);
    }

    addLog({
      level: 'warn',
      module: 'hardware',
      message: `Placa eliminada del repositorio de hardware (ID: ${id})`
    });
  };

  // CRUD Components Catalog
  const createComponent = async (
    component: Omit<ComponentCatalogItem, 'id' | 'createdAt'>
  ): Promise<ComponentCatalogItem> => {
    const newItem: ComponentCatalogItem = {
      ...component,
      id: 'cmp_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    setComponents((prev) => [...prev, newItem]);

    try {
      await setDoc(doc(db, 'components', newItem.id), newItem);
    } catch (error) {
      console.warn('Firestore createComponent fallback to local:', error);
    }

    addLog({
      level: 'info',
      module: 'component',
      message: `Componente agregado al catálogo: "${newItem.name}" (${newItem.category})`
    });
    return newItem;
  };

  const updateComponent = async (id: string, updates: Partial<ComponentCatalogItem>) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    try {
      await updateDoc(doc(db, 'components', id), updates);
    } catch (error) {
      console.warn('Firestore updateComponent fallback to local:', error);
    }

    addLog({
      level: 'info',
      module: 'component',
      message: `Componente del catálogo actualizado (ID: ${id})`
    });
  };

  const deleteComponent = async (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'components', id));
    } catch (error) {
      console.warn('Firestore deleteComponent fallback to local:', error);
    }

    addLog({
      level: 'warn',
      module: 'component',
      message: `Componente retirado del catálogo (ID: ${id})`
    });
  };

  // CRUD Project Components
  const addProjectComponent = async (
    item: Omit<ProjectComponent, 'id' | 'addedAt'>
  ): Promise<ProjectComponent> => {
    const newItem: ProjectComponent = {
      ...item,
      id: 'pc_' + Date.now().toString(36),
      addedAt: new Date().toISOString()
    };
    setProjectComponents((prev) => [...prev, newItem]);

    try {
      await setDoc(doc(db, 'projectComponents', newItem.id), newItem);
    } catch (error) {
      console.warn('Firestore addProjectComponent fallback to local:', error);
    }

    addLog({
      projectId: item.projectId,
      level: 'info',
      module: 'component',
      message: `Componente "${newItem.customLabel}" asignado al proyecto.`
    });
    return newItem;
  };

  const updateProjectComponent = async (id: string, updates: Partial<ProjectComponent>) => {
    setProjectComponents((prev) => prev.map((pc) => (pc.id === id ? { ...pc, ...updates } : pc)));
    try {
      await updateDoc(doc(db, 'projectComponents', id), updates);
    } catch (error) {
      console.warn('Firestore updateProjectComponent fallback to local:', error);
    }
  };

  const removeProjectComponent = async (id: string) => {
    const target = projectComponents.find((pc) => pc.id === id);
    setProjectComponents((prev) => prev.filter((pc) => pc.id !== id));
    setConnections((prev) => prev.filter((c) => c.projectComponentId !== id));

    try {
      await deleteDoc(doc(db, 'projectComponents', id));
    } catch (error) {
      console.warn('Firestore removeProjectComponent fallback to local:', error);
    }

    if (target) {
      addLog({
        projectId: target.projectId,
        level: 'warn',
        module: 'component',
        message: `Componente "${target.customLabel}" y sus conexiones asociadas han sido retirados.`
      });
    }
  };

  // CRUD Connections
  const createConnection = async (
    conn: Omit<Connection, 'id' | 'createdAt'>
  ): Promise<Connection> => {
    const newConn: Connection = {
      ...conn,
      id: 'conn_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    setConnections((prev) => [...prev, newConn]);

    try {
      await setDoc(doc(db, 'connections', newConn.id), newConn);
    } catch (error) {
      console.warn('Firestore createConnection fallback to local:', error);
    }

    addLog({
      projectId: conn.projectId,
      level: 'info',
      module: 'pins',
      message: `Conexión de pin registrada: [${newConn.boardPin}] ───► [${newConn.componentPin}] (${newConn.signalType})`
    });
    return newConn;
  };

  const updateConnection = async (id: string, updates: Partial<Connection>) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    try {
      await updateDoc(doc(db, 'connections', id), updates);
    } catch (error) {
      console.warn('Firestore updateConnection fallback to local:', error);
    }

    addLog({
      level: 'info',
      module: 'pins',
      message: `Conexión de pin actualizada (ID: ${id})`
    });
  };

  const deleteConnection = async (id: string) => {
    const target = connections.find((c) => c.id === id);
    setConnections((prev) => prev.filter((c) => c.id !== id));

    try {
      await deleteDoc(doc(db, 'connections', id));
    } catch (error) {
      console.warn('Firestore deleteConnection fallback to local:', error);
    }

    if (target) {
      addLog({
        projectId: target.projectId,
        level: 'warn',
        module: 'pins',
        message: `Conexión en pin ${target.boardPin} desconectada.`
      });
    }
  };

  // CRUD Tests
  const createTest = async (test: Omit<TestPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestPlan> => {
    const now = new Date().toISOString();
    const newTest: TestPlan = {
      ...test,
      id: 'test_' + Date.now().toString(36),
      createdAt: now,
      updatedAt: now
    };
    setTests((prev) => [...prev, newTest]);

    try {
      await setDoc(doc(db, 'tests', newTest.id), newTest);
    } catch (error) {
      console.warn('Firestore createTest fallback to local:', error);
    }

    addLog({
      projectId: test.projectId,
      level: 'info',
      module: 'test',
      message: `Plan de prueba creado: "${newTest.title}" [Severidad: ${newTest.severity}]`
    });
    return newTest;
  };

  const updateTest = async (id: string, updates: Partial<TestPlan>) => {
    const now = new Date().toISOString();
    setTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
    );

    try {
      await updateDoc(doc(db, 'tests', id), { ...updates, updatedAt: now });
    } catch (error) {
      console.warn('Firestore updateTest fallback to local:', error);
    }
  };

  const deleteTest = async (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
    setTestResults((prev) => prev.filter((r) => r.testId !== id));

    try {
      await deleteDoc(doc(db, 'tests', id));
    } catch (error) {
      console.warn('Firestore deleteTest fallback to local:', error);
    }
  };

  // CRUD Test Results
  const addTestResult = async (result: Omit<TestResult, 'id' | 'executedAt'>): Promise<TestResult> => {
    const newResult: TestResult = {
      ...result,
      id: 'tr_' + Date.now().toString(36),
      executedAt: new Date().toISOString()
    };
    setTestResults((prev) => [newResult, ...prev]);

    if (newResult.status === 'passed') {
      updateTest(newResult.testId, { status: 'passed' });
    } else if (newResult.status === 'failed') {
      updateTest(newResult.testId, { status: 'failed' });
    }

    try {
      await setDoc(doc(db, 'testResults', newResult.id), newResult);
    } catch (error) {
      console.warn('Firestore addTestResult fallback to local:', error);
    }

    addLog({
      projectId: result.projectId,
      level: newResult.status === 'failed' ? 'error' : 'info',
      module: 'test',
      message: `Resultado de prueba registrado: ${newResult.status.toUpperCase()} (${newResult.observedOutcome.slice(0, 60)}...)`
    });

    return newResult;
  };

  const deleteTestResult = async (id: string) => {
    setTestResults((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'testResults', id));
    } catch (error) {
      console.warn('Firestore deleteTestResult fallback to local:', error);
    }
  };

  // Telemetry & Logs
  const addTelemetryPoint = async (
    point: Omit<TelemetryDataPoint, 'id' | 'timestamp'>
  ): Promise<TelemetryDataPoint> => {
    const newPoint: TelemetryDataPoint = {
      ...point,
      id: 'tel_' + Date.now().toString(36),
      timestamp: new Date().toISOString()
    };
    setTelemetry((prev) => [newPoint, ...prev.slice(0, 199)]);

    try {
      await setDoc(doc(db, 'telemetry', newPoint.id), newPoint);
    } catch (error) {
      console.warn('Firestore addTelemetryPoint fallback to local:', error);
    }

    return newPoint;
  };

  const generateSimulatedTelemetryBatch = (projectId: string) => {
    const now = new Date();
    const targetPrj = projects.find((p) => p.id === projectId);
    const boardId = targetPrj?.boardId || 'brd_simulated';

    const tempVal = Number((23 + Math.random() * 4).toFixed(1));
    const humVal = Number((48 + Math.random() * 12).toFixed(1));
    const heapVal = Number((180 + Math.random() * 10).toFixed(1));
    const loopHz = Math.round(95 + Math.random() * 15);

    const points: TelemetryDataPoint[] = [
      {
        id: 'tel_' + Math.random().toString(36).slice(2, 7),
        projectId,
        boardId,
        metric: 'temperature',
        value: tempVal,
        unit: '°C',
        simulated: true,
        timestamp: now.toISOString()
      },
      {
        id: 'tel_' + Math.random().toString(36).slice(2, 7),
        projectId,
        boardId,
        metric: 'humidity',
        value: humVal,
        unit: '%',
        simulated: true,
        timestamp: now.toISOString()
      },
      {
        id: 'tel_' + Math.random().toString(36).slice(2, 7),
        projectId,
        boardId,
        metric: 'free_heap',
        value: heapVal,
        unit: 'KB',
        simulated: true,
        timestamp: now.toISOString()
      },
      {
        id: 'tel_' + Math.random().toString(36).slice(2, 7),
        projectId,
        boardId,
        metric: 'loop_frequency_hz',
        value: loopHz,
        unit: 'Hz',
        simulated: true,
        timestamp: now.toISOString()
      }
    ];

    setTelemetry((prev) => [...points, ...prev.slice(0, 190)]);
    // Also save in background to Firestore
    points.forEach((pt) => {
      setDoc(doc(db, 'telemetry', pt.id), pt).catch(() => {});
    });

    addLog({
      projectId,
      level: 'debug',
      module: 'firmware_stub',
      message: `Telemetría simulada recibida: T=${tempVal}°C | H=${humVal}% | Heap=${heapVal}KB | Freq=${loopHz}Hz`
    });
  };

  const addLog = async (log: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = {
      ...log,
      id: 'log_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      timestamp: new Date().toISOString()
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 300)]);

    try {
      await setDoc(doc(db, 'logs', newLog.id), newLog);
    } catch {
      // ignore
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportDatabaseJSON = () => {
    const snapshot = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      projectId: firebaseConfig.projectId,
      schema: {
        users: [currentUser],
        projects,
        boards,
        components,
        projectComponents,
        connections,
        tests,
        testResults,
        telemetry,
        logs
      }
    };
    return JSON.stringify(snapshot, null, 2);
  };

  const resetDatabaseToDefault = () => {
    setCurrentUser(INITIAL_USER);
    setProjects(INITIAL_PROJECTS);
    setBoards(INITIAL_BOARDS);
    setComponents(INITIAL_COMPONENTS);
    setProjectComponents(INITIAL_PROJECT_COMPONENTS);
    setConnections(INITIAL_CONNECTIONS);
    setTests(INITIAL_TESTS);
    setTestResults(INITIAL_TEST_RESULTS);
    setTelemetry(INITIAL_TELEMETRY);
    setLogs(INITIAL_LOGS);
    setActiveProjectId(INITIAL_PROJECTS[0]?.id || null);
    addLog({
      level: 'info',
      module: 'system',
      message: 'Base de datos restaurada a los valores predeterminados.'
    });
  };

  return (
    <DatabaseContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginUser,
        signInWithGoogle,
        logoutUser,
        activeProjectId,
        setActiveProjectId,
        activeProject,
        projects,
        boards,
        components,
        projectComponents,
        connections,
        tests,
        testResults,
        telemetry,
        logs,
        createProject,
        updateProject,
        deleteProject,
        createBoard,
        updateBoard,
        deleteBoard,
        createComponent,
        updateComponent,
        deleteComponent,
        addProjectComponent,
        updateProjectComponent,
        removeProjectComponent,
        createConnection,
        updateConnection,
        deleteConnection,
        createTest,
        updateTest,
        deleteTest,
        addTestResult,
        deleteTestResult,
        addTelemetryPoint,
        generateSimulatedTelemetryBatch,
        addLog,
        clearLogs,
        isFirebaseLive,
        firebaseProjectId: firebaseConfig.projectId,
        firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
        syncStatus,
        seedFirestoreDefaults,
        exportDatabaseJSON,
        resetDatabaseToDefault
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
