/**
 * CronoFocus - IndexedDB Utilities
 * Funções auxiliares para operações no banco
 */

import { toRaw, isProxy } from 'vue'

/**
 * Converte objetos Vue reativos para objetos puros clonáveis
 * Isso é necessário porque IndexedDB não pode clonar Vue Proxies
 */
export function toCloneable(data) {
  if (data === null || data === undefined) return data
  if (typeof data !== 'object') return data

  // Se for um Proxy Vue, converter para objeto puro
  const raw = isProxy(data) ? toRaw(data) : data

  // Se for um array, mapear recursivamente
  if (Array.isArray(raw)) {
    return raw.map(item => toCloneable(item))
  }

  // Se for uma data, converter para ISO string
  if (raw instanceof Date) {
    return raw.toISOString()
  }

  // Se for um objeto, criar cópia profunda
  const result = {}
  for (const key in raw) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      const value = raw[key]
      // Ignorar funções e símbolos
      if (typeof value === 'function' || typeof value === 'symbol') continue
      result[key] = toCloneable(value)
    }
  }
  return result
}

/**
 * Formata data para string ISO (apenas data, sem hora)
 */
export function formatDateString(date) {
  if (typeof date === 'string') return date
  return date.toISOString().split('T')[0]
}

/**
 * Gera timestamp ISO atual
 */
export function now() {
  return new Date().toISOString()
}
