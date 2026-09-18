// MicroLab Type Definitions according to Firestore schema

export type UserRole = 'admin' | 'maker' | 'developer' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  bio?: string;
}

export type BoardFamily = 'arduino' | 'esp32' | 'esp8266' | 'raspberry_pi_pico' | 'stm32' | 'other';
export type BoardVoltage = '5V' | '3.3V' | 'dual';

export interface Board {
  id: string;
  name: string; // e.g. "ESP32 DevKit V1", "Arduino Uno R3", "Arduino Nano Every"
  family: BoardFamily;
  microcontroller: string; // e.g. "ESP-WROOM-32", "ATmega328P"
  operatingVoltage: BoardVoltage;
  digitalPins: number;
  analogPins: number;
  pwmPins: number;
  hasWifi: boolean;
  hasBluetooth: boolean;
  clockSpeedMhz: number;
  flashMemoryKb: number;
  pinoutMap: string[]; // List of available pin names like ['D0', 'D1', 'D2', 'A0', ...]
  imageUrl?: string;
  description?: string;
  createdAt: string;
}

export type ComponentCategory = 'sensor' | 'actuator' | 'display' | 'input' | 'power' | 'communication' | 'passive';

export interface ComponentCatalogItem {
  id: string;
  name: string; // e.g. "DHT22 (Sensor Temperatura/Humedad)", "Servo SG90"
  category: ComponentCategory;
  model: string;
  operatingVoltage: string; // e.g. "3.3V - 5V"
  protocol: 'digital' | 'analog' | 'i2c' | 'spi' | 'uart' | 'pwm' | 'gpio';
  defaultPins: string[]; // typical pins required e.g. ["VCC", "GND", "DATA"]
  description: string;
  datasheetUrl?: string;
  iconName?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: 'planning' | 'prototyping' | 'testing' | 'deployed' | 'archived';
  boardId: string; // references Board
  tags: string[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isFavorite?: boolean;
}

export interface ProjectComponent {
  id: string;
  projectId: string;
  componentCatalogId: string; // references ComponentCatalogItem
  customLabel: string; // e.g. "Sensor Interior Habitación"
  quantity: number;
  notes?: string;
  addedAt: string;
}

export interface Connection {
  id: string;
  projectId: string;
  projectComponentId: string;
  boardPin: string; // e.g. "D4", "GPIO21", "A0", "3V3", "GND"
  componentPin: string; // e.g. "DATA", "SDA", "VCC"
  signalType: 'digital_in' | 'digital_out' | 'analog_in' | 'pwm' | 'i2c_sda' | 'i2c_scl' | 'power_vcc' | 'ground';
  wireColor: string; // hex color for breadboard visualizer e.g. "#ef4444" (red), "#3b82f6" (blue)
  resistorOhm?: number; // e.g. 220, 10000 (pull-up/down)
  notes?: string;
  createdAt: string;
}

export interface TestPlan {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetComponentId?: string; // Optional reference to a specific component
  expectedOutcome: string;
  status: 'pending' | 'in_progress' | 'passed' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  testId: string;
  projectId: string;
  executedBy: string;
  executedAt: string;
  status: 'passed' | 'failed' | 'inconclusive';
  observedOutcome: string;
  voltageMeasured?: number;
  signalVerified?: boolean;
  notes?: string;
  durationMs?: number;
}

export interface TelemetryDataPoint {
  id: string;
  projectId: string;
  boardId: string;
  timestamp: string;
  metric: string; // e.g. "temperature", "humidity", "cpu_load", "free_heap", "loop_frequency_hz"
  value: number;
  unit: string; // e.g. "°C", "%", "KB", "Hz"
  simulated: boolean;
}

export interface SystemLog {
  id: string;
  projectId?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  module: 'hardware' | 'pins' | 'component' | 'test' | 'firmware_stub' | 'system';
  message: string;
  details?: string;
  timestamp: string;
}
