/**
 * CronoFocus - IndexedDB Core
 * Inicialização e conexão com o banco de dados
 */

import { ref } from 'vue'
import { DB_NAME, DB_VERSION, DB_SCHEMA } from './schema'

// Estado global do banco (singleton)
export const db = ref(null)
export const isReady = ref(false)
export const dbError = ref(null)

/**
 * Inicializa o banco de dados IndexedDB
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    if (db.value) {
      resolve(db.value)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      dbError.value = event.target.error
      console.error('Erro ao abrir IndexedDB:', event.target.error)
      reject(event.target.error)
    }

    request.onsuccess = (event) => {
      db.value = event.target.result
      isReady.value = true
      resolve(db.value)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Criar stores conforme schema
      Object.entries(DB_SCHEMA).forEach(([storeName, config]) => {
        if (!database.objectStoreNames.contains(storeName)) {
          const store = database.createObjectStore(storeName, {
            keyPath: config.keyPath
          })

          // Criar índices
          config.indexes.forEach(index => {
            store.createIndex(index.name, index.keyPath, index.options)
          })
        }
      })
    }
  })
}

/**
 * Obtém uma object store para operações
 */
export function getStore(storeName, mode = 'readonly') {
  if (!db.value) throw new Error('Database não inicializado')
  const transaction = db.value.transaction(storeName, mode)
  return transaction.objectStore(storeName)
}
