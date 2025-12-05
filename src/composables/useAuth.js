/**
 * CronoFocus - Auth Composable
 * Sistema de autenticação local modularizado
 */

import { useIndexedDB } from './useIndexedDB'

// Importar módulos
import { encryptData, decryptData } from './auth/crypto'
import {
  currentUser,
  isAuthenticated,
  isLoading,
  authError,
  readonlyState,
  userInitials,
  isGuest,
  getSavedSession,
  setCurrentUser
} from './auth/session'
import {
  AVATAR_COLORS,
  register,
  login,
  logout,
  updateProfile,
  verifyCurrentPassword,
  deleteAccount,
  listProfiles,
  useGuestMode
} from './auth/profiles'

/**
 * Composable de autenticação
 */
export function useAuth() {
  const { initDB, get, updateLastLogin } = useIndexedDB()

  /**
   * Inicializa o sistema de autenticação
   */
  async function initAuth() {
    try {
      isLoading.value = true
      await initDB()

      // Verificar se há sessão salva
      const savedSession = getSavedSession()
      if (savedSession) {
        const user = await get('users', savedSession.userId)

        if (user) {
          setCurrentUser(user)
          await updateLastLogin(user.id)
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar auth:', error)
      authError.value = error.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Estado (readonly)
    ...readonlyState,

    // Computed
    userInitials,
    isGuest,

    // Constantes
    AVATAR_COLORS,

    // Métodos
    initAuth,
    register,
    login,
    logout,
    updateProfile,
    verifyCurrentPassword,
    deleteAccount,
    listProfiles,
    useGuestMode,

    // Criptografia
    encryptData,
    decryptData
  }
}
