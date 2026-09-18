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

export const INITIAL_USER: UserProfile = {
  id: 'usr_maker_01',
  email: 'maker@microlab.io',
  displayName: 'Alex Maker (Ingeniero IoT)',
  photoURL: '',
  role: 'maker',
  createdAt: '2026-01-10T10:00:00Z',
  bio: 'Desarrollador de sistemas embebidos, apasionado por domótica con ESP32 y robótica educativa con Arduino.'
};

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'brd_esp32_devkit_v1',
    name: 'ESP32 DevKit V1 (30 Pines)',
    family: 'esp32',
    microcontroller: 'Xtensa Dual-Core 32-bit LX6',
    operatingVoltage: '3.3V',
    digitalPins: 25,
    analogPins: 15,
    pwmPins: 16,
    hasWifi: true,
    hasBluetooth: true,
    clockSpeedMhz: 240,
    flashMemoryKb: 4096,
    pinoutMap: [
      '3V3', 'GND', 'D15', 'D2', 'D4', 'RX2', 'TX2', 'D5', 'D18', 'D19',
      'D21', 'RX0', 'TX0', 'D22', 'D23', 'EN', 'VP(36)', 'VN(39)', 'D34',
      'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'D13', 'VIN'
    ],
    description: 'Placa de desarrollo potente con conectividad dual Wi-Fi y Bluetooth BLE, perfecta para proyectos IoT y telemetría.',
    createdAt: '2026-01-12T08:00:00Z'
  },
  {
    id: 'brd_arduino_uno_r3',
    name: 'Arduino Uno R3',
    family: 'arduino',
    microcontroller: 'ATmega328P',
    operatingVoltage: '5V',
    digitalPins: 14,
    analogPins: 6,
    pwmPins: 6,
    hasWifi: false,
    hasBluetooth: false,
    clockSpeedMhz: 16,
    flashMemoryKb: 32,
    pinoutMap: [
      'IOREF', 'RESET', '3.3V', '5V', 'GND_1', 'GND_2', 'VIN',
      'A0', 'A1', 'A2', 'A3', 'A4(SDA)', 'A5(SCL)',
      'D0(RX)', 'D1(TX)', 'D2', 'D3~', 'D4', 'D5~', 'D6~', 'D7',
      'D8', 'D9~', 'D10~', 'D11~', 'D12', 'D13', 'GND_3', 'AREF'
    ],
    description: 'El estándar clásico de microcontroladores para prototipado rápido y aprendizaje con lógica de 5V robusta.',
    createdAt: '2026-01-12T08:30:00Z'
  },
  {
    id: 'brd_esp8266_nodemcu',
    name: 'NodeMCU ESP8266 V3',
    family: 'esp8266',
    microcontroller: 'Tensilica L106 32-bit',
    operatingVoltage: '3.3V',
    digitalPins: 11,
    analogPins: 1,
    pwmPins: 10,
    hasWifi: true,
    hasBluetooth: false,
    clockSpeedMhz: 80,
    flashMemoryKb: 4096,
    pinoutMap: [
      'A0', 'GND', 'VU', 'S3', 'S2', 'S1', 'SC', 'S0', 'SK', 'GND', '3V3',
      'EN', 'RST', 'GND', 'VIN', 'D0(16)', 'D1(5)', 'D2(4)', 'D3(0)', 'D4(2)',
      '3V3', 'GND', 'D5(14)', 'D6(12)', 'D7(13)', 'D8(15)', 'RX(3)', 'TX(1)'
    ],
    description: 'Módulo ultraligero y económico con Wi-Fi integrado, ideal para nodos de sensores sencillos.',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'brd_rp2040_pico',
    name: 'Raspberry Pi Pico',
    family: 'raspberry_pi_pico',
    microcontroller: 'RP2040 Dual ARM Cortex-M0+',
    operatingVoltage: '3.3V',
    digitalPins: 26,
    analogPins: 3,
    pwmPins: 16,
    hasWifi: false,
    hasBluetooth: false,
    clockSpeedMhz: 133,
    flashMemoryKb: 2048,
    pinoutMap: [
      'GP0', 'GP1', 'GND', 'GP2', 'GP3', 'GP4', 'GP5', 'GND', 'GP6', 'GP7',
      'GP8', 'GP9', 'GND', 'GP10', 'GP11', 'GP12', 'GP13', 'GND', 'GP14', 'GP15',
      'GP16', 'GP17', 'GND', 'GP18', 'GP19', 'GP20', 'GP21', 'GND', 'GP22', 'RUN',
      'GP26_ADC0', 'GP27_ADC1', 'GND', 'GP28_ADC2', 'ADC_VREF', '3V3', '3V3_EN', 'GND', 'VSYS', 'VBUS'
    ],
    description: 'Potente microcontrolador con IO programable (PIO) y alto rendimiento computacional.',
    createdAt: '2026-01-20T11:00:00Z'
  }
];

export const INITIAL_COMPONENTS: ComponentCatalogItem[] = [
  {
    id: 'cmp_dht22',
    name: 'DHT22 / AM2302',
    category: 'sensor',
    model: 'Sensor Digital Temperatura y Humedad',
    operatingVoltage: '3.3V - 5.5V',
    protocol: 'digital',
    defaultPins: ['VCC', 'GND', 'DATA'],
    description: 'Sensor capacitivo de alta precisión para medir temperatura (-40 a 80 °C) y humedad relativa (0 a 100%).',
    iconName: 'thermometer',
    createdAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 'cmp_oled_i2c',
    name: 'Pantalla OLED 0.96" I2C SSD1306',
    category: 'display',
    model: 'SSD1306 (128x64 px)',
    operatingVoltage: '3.3V - 5V',
    protocol: 'i2c',
    defaultPins: ['VCC', 'GND', 'SCL', 'SDA'],
    description: 'Display gráfico monocromático de alto contraste y bajo consumo, ideal para instrumentación local.',
    iconName: 'tv',
    createdAt: '2026-01-12T10:05:00Z'
  },
  {
    id: 'cmp_servo_sg90',
    name: 'Servomotor SG90 Micro',
    category: 'actuator',
    model: 'Micro Servo 9g (180°)',
    operatingVoltage: '4.8V - 6V',
    protocol: 'pwm',
    defaultPins: ['VCC', 'GND', 'PWM_SIGNAL'],
    description: 'Motor de posicionamiento angular de 0° a 180° para robótica liviana y mecanismos de cierre.',
    iconName: 'cpu',
    createdAt: '2026-01-12T10:10:00Z'
  },
  {
    id: 'cmp_led_rgb',
    name: 'Módulo LED RGB (Cátodo Común)',
    category: 'actuator',
    model: 'LED Tricolor 5mm',
    operatingVoltage: '3.3V - 5V (con resistencias)',
    protocol: 'pwm',
    defaultPins: ['RED', 'GREEN', 'BLUE', 'GND'],
    description: 'Indicador luminoso multicolor para estados del sistema, alertas visuales y diagnósticos.',
    iconName: 'sun',
    createdAt: '2026-01-12T10:15:00Z'
  },
  {
    id: 'cmp_push_button',
    name: 'Pulsador Táctil (Push Button)',
    category: 'input',
    model: 'Momentary Push Button 12x12mm',
    operatingVoltage: '3.3V - 5V',
    protocol: 'digital',
    defaultPins: ['PIN_1', 'PIN_2'],
    description: 'Interruptor momentáneo para control de encendido, modo de operación o reset.',
    iconName: 'mouse-pointer-click',
    createdAt: '2026-01-12T10:20:00Z'
  },
  {
    id: 'cmp_potentiometer',
    name: 'Potenciómetro Lineal 10k',
    category: 'input',
    model: 'Potenciómetro B10K Rotativo',
    operatingVoltage: '0 - 5V',
    protocol: 'analog',
    defaultPins: ['VCC', 'GND', 'SIGNAL_OUT'],
    description: 'Entrada analógica regulable para control de velocidad, umbrales de activación o volumen.',
    iconName: 'sliders',
    createdAt: '2026-01-12T10:25:00Z'
  },
  {
    id: 'cmp_relay_module',
    name: 'Módulo Relé 5V 1-Canal',
    category: 'actuator',
    model: 'Relé Optoacoplado 10A 250VAC',
    operatingVoltage: '5V',
    protocol: 'digital',
    defaultPins: ['VCC', 'GND', 'IN'],
    description: 'Conmutador electromecánico aislado para controlar cargas de alta tensión como lámparas o bombas.',
    iconName: 'zap',
    createdAt: '2026-01-12T10:30:00Z'
  },
  {
    id: 'cmp_ultrasonic_hcsr04',
    name: 'Sensor Ultrasonido HC-SR04',
    category: 'sensor',
    model: 'Transductor Ultrasónico de Distancia',
    operatingVoltage: '5V',
    protocol: 'digital',
    defaultPins: ['VCC', 'GND', 'TRIG', 'ECHO'],
    description: 'Medición de distancia por eco sonoro desde 2cm hasta 400cm con resolución de 0.3cm.',
    iconName: 'radar',
    createdAt: '2026-01-12T10:35:00Z'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj_estacion_clima',
    userId: 'usr_maker_01',
    name: 'Estación Meteorológica Doméstica IoT',
    description: 'Monitoreo ambiental con sensor de temperatura/humedad DHT22, pantalla OLED y alerta luminosa RGB.',
    status: 'testing',
    boardId: 'brd_esp32_devkit_v1',
    tags: ['ESP32', 'IoT', 'Sensores', 'I2C', 'Clima'],
    notes: 'Configurado con ciclo de lectura cada 2000ms. Listo para integrar telemetría.',
    isFavorite: true,
    createdAt: '2026-01-25T14:30:00Z',
    updatedAt: '2026-02-10T18:20:00Z'
  },
  {
    id: 'prj_brazo_robotico',
    userId: 'usr_maker_01',
    name: 'Brazo Robótico 2-DOF con Potenciómetros',
    description: 'Control manual y servo-asistido para manipular piezas ligeras con potenciómetros analógicos.',
    status: 'prototyping',
    boardId: 'brd_arduino_uno_r3',
    tags: ['Arduino Uno', 'Robótica', 'Servos', 'PWM', 'Analógico'],
    notes: 'Requiere fuente de alimentación externa de 5V 2A para evitar caídas de tensión en los servos.',
    isFavorite: false,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-05T12:00:00Z'
  }
];

export const INITIAL_PROJECT_COMPONENTS: ProjectComponent[] = [
  {
    id: 'pc_dht22_estacion',
    projectId: 'prj_estacion_clima',
    componentCatalogId: 'cmp_dht22',
    customLabel: 'Sensor Clima Exterior',
    quantity: 1,
    notes: 'Resistencia pull-up de 4.7k entre VCC y DATA.',
    addedAt: '2026-01-25T14:35:00Z'
  },
  {
    id: 'pc_oled_estacion',
    projectId: 'prj_estacion_clima',
    componentCatalogId: 'cmp_oled_i2c',
    customLabel: 'OLED Display Principal',
    quantity: 1,
    notes: 'Dirección I2C default 0x3C.',
    addedAt: '2026-01-25T14:38:00Z'
  },
  {
    id: 'pc_rgb_estacion',
    projectId: 'prj_estacion_clima',
    componentCatalogId: 'cmp_led_rgb',
    customLabel: 'LED Estado y Alerta Térmica',
    quantity: 1,
    notes: 'Resistencias limitadoras de 220Ω en cada canal de color.',
    addedAt: '2026-01-25T14:40:00Z'
  },
  {
    id: 'pc_servo_base',
    projectId: 'prj_brazo_robotico',
    componentCatalogId: 'cmp_servo_sg90',
    customLabel: 'Servo Base Giratoria',
    quantity: 1,
    notes: 'Eje Z horizontal.',
    addedAt: '2026-02-01T10:15:00Z'
  },
  {
    id: 'pc_pot_base',
    projectId: 'prj_brazo_robotico',
    componentCatalogId: 'cmp_potentiometer',
    customLabel: 'Potenciómetro Eje Base',
    quantity: 1,
    notes: 'Mapeo analógico de 0 a 1023 -> 0 a 180 grados.',
    addedAt: '2026-02-01T10:20:00Z'
  }
];

export const INITIAL_CONNECTIONS: Connection[] = [
  // DHT22 connections
  {
    id: 'conn_dht_data',
    projectId: 'prj_estacion_clima',
    projectComponentId: 'pc_dht22_estacion',
    boardPin: 'D4',
    componentPin: 'DATA',
    signalType: 'digital_in',
    wireColor: '#eab308', // yellow
    resistorOhm: 4700,
    notes: 'Línea de datos 1-Wire con pullup',
    createdAt: '2026-01-25T15:00:00Z'
  },
  {
    id: 'conn_dht_vcc',
    projectId: 'prj_estacion_clima',
    projectComponentId: 'pc_dht22_estacion',
    boardPin: '3V3',
    componentPin: 'VCC',
    signalType: 'power_vcc',
    wireColor: '#ef4444', // red
    createdAt: '2026-01-25T15:01:00Z'
  },
  {
    id: 'conn_dht_gnd',
    projectId: 'prj_estacion_clima',
    projectComponentId: 'pc_dht22_estacion',
    boardPin: 'GND',
    componentPin: 'GND',
    signalType: 'ground',
    wireColor: '#0f172a', // dark/black
    createdAt: '2026-01-25T15:02:00Z'
  },
  // OLED I2C connections
  {
    id: 'conn_oled_sda',
    projectId: 'prj_estacion_clima',
    projectComponentId: 'pc_oled_estacion',
    boardPin: 'D21',
    componentPin: 'SDA',
    signalType: 'i2c_sda',
    wireColor: '#3b82f6', // blue
    notes: 'ESP32 Hardware SDA Default',
    createdAt: '2026-01-25T15:05:00Z'
  },
  {
    id: 'conn_oled_scl',
    projectId: 'prj_estacion_clima',
    projectComponentId: 'pc_oled_estacion',
    boardPin: 'D22',
    componentPin: 'SCL',
    signalType: 'i2c_scl',
    wireColor: '#10b981', // green
    notes: 'ESP32 Hardware SCL Default',
    createdAt: '2026-01-25T15:06:00Z'
  },
  // LED RGB connections
  {
    id: 'conn_rgb_red',
    projectId: 'prj_estacion_clima',
    projectComponentId: 'pc_rgb_estacion',
    boardPin: 'D25',
    componentPin: 'RED',
    signalType: 'pwm',
    wireColor: '#f43f5e',
    resistorOhm: 220,
    notes: 'Canal PWM LEDC 0',
    createdAt: '2026-01-25T15:10:00Z'
  },
  {
    id: 'conn_rgb_green',
    projectId: 'prj_estacion_clima',
    projectComponentId: 'pc_rgb_estacion',
    boardPin: 'D26',
    componentPin: 'GREEN',
    signalType: 'pwm',
    wireColor: '#22c55e',
    resistorOhm: 220,
    notes: 'Canal PWM LEDC 1',
    createdAt: '2026-01-25T15:11:00Z'
  },
  {
    id: 'conn_rgb_blue',
    projectId: 'prj_estacion_clima',
    projectComponentId: 'pc_rgb_estacion',
    boardPin: 'D27',
    componentPin: 'BLUE',
    signalType: 'pwm',
    wireColor: '#06b6d4',
    resistorOhm: 220,
    notes: 'Canal PWM LEDC 2',
    createdAt: '2026-01-25T15:12:00Z'
  }
];

export const INITIAL_TESTS: TestPlan[] = [
  {
    id: 'test_dht_read',
    projectId: 'prj_estacion_clima',
    title: 'Verificación de lectura continua DHT22',
    description: 'Comprobar que el sensor responde en el pin D4 sin timeouts de checksum durante 5 minutos consecutivos.',
    targetComponentId: 'pc_dht22_estacion',
    expectedOutcome: 'Respuestas con humedad entre 30-70% y temperatura entre 18-35°C sin lecturas NaN.',
    status: 'passed',
    severity: 'high',
    createdAt: '2026-01-26T10:00:00Z',
    updatedAt: '2026-01-26T11:30:00Z'
  },
  {
    id: 'test_i2c_oled_scan',
    projectId: 'prj_estacion_clima',
    title: 'Escaneo de Bus I2C y Refresco OLED',
    description: 'Validar presencia de dispositivo en dirección 0x3C en pines D21/D22 y renderizado de texto y figuras.',
    targetComponentId: 'pc_oled_estacion',
    expectedOutcome: 'Dispositivo reconocido en 0x3C y actualización de frames a 30 FPS sin parpadeo.',
    status: 'passed',
    severity: 'medium',
    createdAt: '2026-01-26T10:30:00Z',
    updatedAt: '2026-01-26T12:00:00Z'
  },
  {
    id: 'test_pwm_rgb_sweep',
    projectId: 'prj_estacion_clima',
    title: 'Prueba de barrido de color PWM en LED RGB',
    description: 'Graduación de ciclos de trabajo de 0% a 100% en D25, D26 y D27 para verificar mezcla lumínica.',
    targetComponentId: 'pc_rgb_estacion',
    expectedOutcome: 'Transición suave de colores sin parpadeos perceptibles ni sobrecalentamiento de resistencias.',
    status: 'in_progress',
    severity: 'low',
    createdAt: '2026-01-26T11:00:00Z',
    updatedAt: '2026-01-27T09:00:00Z'
  }
];

export const INITIAL_TEST_RESULTS: TestResult[] = [
  {
    id: 'tr_dht_01',
    testId: 'test_dht_read',
    projectId: 'prj_estacion_clima',
    executedBy: 'Alex Maker',
    executedAt: '2026-01-26T11:28:00Z',
    status: 'passed',
    observedOutcome: 'Lectura estable: Temp 24.3 °C, Humedad 54.2%. 0 paquetes de checksum corruptos tras 150 muestras.',
    voltageMeasured: 3.28,
    signalVerified: true,
    notes: 'Pullup de 4.7k funciona óptimo con cable de 15cm.',
    durationMs: 300000
  },
  {
    id: 'tr_oled_01',
    testId: 'test_i2c_oled_scan',
    projectId: 'prj_estacion_clima',
    executedBy: 'Alex Maker',
    executedAt: '2026-01-26T11:55:00Z',
    status: 'passed',
    observedOutcome: 'Bus I2C respondió inmediatamente ACK en dirección 0x3C a 400kHz (Fast Mode).',
    voltageMeasured: 3.3,
    signalVerified: true,
    notes: 'Buffer de pantalla SSD1306 asignado correctamente en memoria RAM.',
    durationMs: 12000
  }
];

export const INITIAL_TELEMETRY: TelemetryDataPoint[] = [
  { id: 'tel_1', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:00:00Z', metric: 'temperature', value: 24.5, unit: '°C', simulated: true },
  { id: 'tel_2', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:01:00Z', metric: 'temperature', value: 24.7, unit: '°C', simulated: true },
  { id: 'tel_3', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:02:00Z', metric: 'temperature', value: 25.1, unit: '°C', simulated: true },
  { id: 'tel_4', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:03:00Z', metric: 'temperature', value: 25.0, unit: '°C', simulated: true },
  { id: 'tel_5', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:04:00Z', metric: 'temperature', value: 24.8, unit: '°C', simulated: true },
  { id: 'tel_6', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:00:00Z', metric: 'humidity', value: 52.0, unit: '%', simulated: true },
  { id: 'tel_7', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:01:00Z', metric: 'humidity', value: 52.4, unit: '%', simulated: true },
  { id: 'tel_8', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:02:00Z', metric: 'humidity', value: 53.1, unit: '%', simulated: true },
  { id: 'tel_9', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:03:00Z', metric: 'humidity', value: 52.8, unit: '%', simulated: true },
  { id: 'tel_10', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:00:00Z', metric: 'free_heap', value: 184.2, unit: 'KB', simulated: true },
  { id: 'tel_11', projectId: 'prj_estacion_clima', boardId: 'brd_esp32_devkit_v1', timestamp: '2026-02-10T18:02:00Z', metric: 'free_heap', value: 182.9, unit: 'KB', simulated: true }
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log_01',
    projectId: 'prj_estacion_clima',
    level: 'info',
    module: 'hardware',
    message: 'Placa ESP32 DevKit V1 vinculada con éxito al proyecto Estación Meteorológica.',
    timestamp: '2026-01-25T14:31:00Z'
  },
  {
    id: 'log_02',
    projectId: 'prj_estacion_clima',
    level: 'info',
    module: 'pins',
    message: 'Mapeo de pines completado: D4 (DHT22), D21 (SDA), D22 (SCL), D25/26/27 (RGB).',
    timestamp: '2026-01-25T15:15:00Z'
  },
  {
    id: 'log_03',
    projectId: 'prj_estacion_clima',
    level: 'warn',
    module: 'pins',
    message: 'Verificación de tensión: Asegúrese de usar resistencias limitadoras en canales RGB para no sobrepasar 12mA por pin GPIO.',
    timestamp: '2026-01-25T15:16:00Z'
  },
  {
    id: 'log_04',
    projectId: 'prj_estacion_clima',
    level: 'debug',
    module: 'firmware_stub',
    message: 'Estructura de payload de telemetría validada para futuro firmware C++/MicroPython.',
    timestamp: '2026-01-26T09:40:00Z'
  },
  {
    id: 'log_05',
    level: 'info',
    module: 'system',
    message: 'Base de datos MicroLab sincronizada con esquema Firestore.',
    timestamp: '2026-02-10T12:00:00Z'
  }
];
