/**
 * CronoFocus - Auth Session Module
 * Gerenciamento de sessão e estado de autenticação
 */

import { ref, computed, readonly } from 'vue'

// Estado global de autenticação (singleton)
export const currentUser = ref(null)
export const isAuthenticated = ref(false)
export const isLoading = ref(true)
export const authError = ref(null)

// Chave de storage
const SESSION_KEY = 'cronofocus_session'

/**
 * Salva sessão no localStorage
 */
export function saveSession(userId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    userId,
    timestamp: Date.now()
  }))
}

/**
 * Obtém sessão salva
 */
export function getSavedSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

/**
 * Remove sessão salva
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Define usuário atual e estado de autenticação
 */
export function setCurrentUser(user) {
  currentUser.value = user
  isAuthenticated.value = !!user
}

/**
 * Computed: Iniciais do usuário para avatar
 */
export const userInitials = computed(() => {
  if (!currentUser.value?.displayName) return '?'
  return currentUser.value.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

/**
 * Computed: Verifica se é usuário convidado
 */
export const isGuest = computed(() => currentUser.value?.isGuest || false)

/**
 * Exporta estado readonly para consumo externo
 */
export const readonlyState = {
  currentUser: readonly(currentUser),
  isAuthenticated: readonly(isAuthenticated),
  isLoading: readonly(isLoading),
  authError: readonly(authError)
}
