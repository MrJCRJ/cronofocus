/**
 * CronoFocus - Auth Store
 * Gerenciamento de estado de autenticação
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

export const useAuthStore = defineStore('auth', () => {
  // Composable
  const auth = useAuth()

  // Estado
  const initialized = ref(false)

  // Getters
  const user = computed(() => auth.currentUser.value)
  const isLoggedIn = computed(() => auth.isAuthenticated.value)
  const isGuest = computed(() => auth.isGuest.value)
  const loading = computed(() => auth.isLoading.value)
  const error = computed(() => auth.authError.value)
  const initials = computed(() => auth.userInitials.value)

  // Actions
  async function initialize() {
    if (initialized.value) return
    await auth.initAuth()
    initialized.value = true
  }

  // Alias for restoreSession (usado em App.vue)
  async function restoreSession() {
    return initialize()
  }

  async function register(userData) {
    return auth.register(userData)
  }

  async function login(username, password) {
    return auth.login(username, password)
  }

  function logout() {
    auth.logout()
  }

  async function updateProfile(updates) {
    return auth.updateProfile(updates)
  }

  async function verifyPassword(password) {
    return auth.verifyCurrentPassword(password)
  }

  async function deleteAccount() {
    return auth.deleteAccount()
  }

  async function listProfiles() {
    return auth.listProfiles()
  }

  async function useGuestMode() {
    return auth.useGuestMode()
  }

  return {
    // Estado
    user,
    isLoggedIn,
    isGuest,
    loading,
    error,
    initials,
    initialized,

    // Constantes
    AVATAR_COLORS: auth.AVATAR_COLORS,

    // Actions
    initialize,
    restoreSession,
    register,
    login,
    logout,
    updateProfile,
    verifyPassword,
    deleteAccount,
    listProfiles,
    useGuestMode
  }
})
