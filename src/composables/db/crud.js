/**
 * CronoFocus - IndexedDB CRUD Operations
 * Operações genéricas de Create, Read, Update, Delete
 */

import { v4 as uuidv4 } from 'uuid'
import { initDB, getStore } from './core'
import { toCloneable, now } from './utils'

/**
 * Adiciona um novo item ao store
 */
export async function add(storeName, data) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const cleanData = toCloneable(data)
    const item = {
      ...cleanData,
      id: cleanData.id || uuidv4(),
      createdAt: cleanData.createdAt || now(),
      updatedAt: now()
    }

    const request = store.add(item)
    request.onsuccess = () => resolve(item)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Busca um item por ID
 */
export async function get(storeName, id) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Busca todos os itens de um store
 */
export async function getAll(storeName) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Atualiza um item existente
 */
export async function update(storeName, data) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const cleanData = toCloneable(data)
    const item = {
      ...cleanData,
      updatedAt: now()
    }

    const request = store.put(item)
    request.onsuccess = () => resolve(item)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Remove um item por ID
 */
export async function remove(storeName, id) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const request = store.delete(id)
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Busca itens por índice
 */
export async function getByIndex(storeName, indexName, value) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Busca itens por range de índice
 */
export async function getByIndexRange(storeName, indexName, lowerBound, upperBound) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const index = store.index(indexName)
    const range = IDBKeyRange.bound(lowerBound, upperBound)
    const request = index.getAll(range)
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Limpa todos os itens de um store
 */
export async function clearStore(storeName) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const request = store.clear()
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Conta itens em um store
 */
export async function count(storeName) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const request = store.count()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
