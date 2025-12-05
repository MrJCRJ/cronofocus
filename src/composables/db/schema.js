/**
 * CronoFocus - IndexedDB Schema
 * Definição do schema e configurações do banco de dados
 */

export const DB_NAME = 'CronoFocusDB'
export const DB_VERSION = 1

/**
 * Schema do banco de dados IndexedDB
 */
export const DB_SCHEMA = {
  users: {
    keyPath: 'id',
    indexes: [
      { name: 'username', keyPath: 'username', options: { unique: true } },
      { name: 'email', keyPath: 'email', options: { unique: false } }
    ]
  },
  days: {
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'date', keyPath: 'date', options: { unique: false } },
      { name: 'userDate', keyPath: ['userId', 'date'], options: { unique: true } }
    ]
  },
  tasks: {
    keyPath: 'id',
    indexes: [
      { name: 'dayId', keyPath: 'dayId', options: { unique: false } },
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'date', keyPath: 'date', options: { unique: false } },
      { name: 'category', keyPath: 'category', options: { unique: false } },
      { name: 'status', keyPath: 'status', options: { unique: false } },
      { name: 'userDate', keyPath: ['userId', 'date'], options: { unique: false } }
    ]
  },
  categories: {
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'color', keyPath: 'color', options: { unique: false } }
    ]
  },
  settings: {
    keyPath: 'userId',
    indexes: [
      { name: 'notificationsEnabled', keyPath: 'notificationsEnabled', options: { unique: false } }
    ]
  },
  exports: {
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'date', keyPath: 'date', options: { unique: false } },
      { name: 'format', keyPath: 'format', options: { unique: false } }
    ]
  },
  distractions: {
    keyPath: 'id',
    indexes: [
      { name: 'taskId', keyPath: 'taskId', options: { unique: false } },
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } }
    ]
  }
}

/**
 * Categorias padrão do sistema
 */
export const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Trabalho', color: '#3b82f6', icon: '💼' },
  { id: 'study', name: 'Estudo', color: '#8b5cf6', icon: '📚' },
  { id: 'exercise', name: 'Exercício', color: '#10b981', icon: '🏃' },
  { id: 'personal', name: 'Pessoal', color: '#f59e0b', icon: '✨' },
  { id: 'leisure', name: 'Lazer', color: '#ec4899', icon: '🎮' },
  { id: 'sleep', name: 'Descanso', color: '#6366f1', icon: '😴' },
  { id: 'health', name: 'Saúde', color: '#14b8a6', icon: '❤️' },
  { id: 'social', name: 'Social', color: '#f97316', icon: '👥' }
]

/**
 * Configurações padrão do usuário
 */
export const DEFAULT_SETTINGS = {
  timeInterval: 30, // minutos
  dayStartHour: 6,
  dayEndHour: 23,
  notificationsEnabled: true,
  soundEnabled: true,
  soundVolume: 0.3,
  reminderMinutes: 5,
  theme: 'dark',
  weekStartsOn: 0, // 0 = Domingo
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h'
}
