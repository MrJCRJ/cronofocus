/**
 * CronoFocus - Auth Profiles Module
 * Operações de perfil de usuário
 */

import { useIndexedDB } from '../useIndexedDB'
import { hashPassword, verifyPassword } from './crypto'
import {
  currentUser,
  isLoading,
  authError,
  isAuthenticated,
  saveSession,
  clearSession,
  setCurrentUser
} from './session'

// Cores de avatar disponíveis
export const AVATAR_COLORS = [
  '#3b82f6', // Azul
  '#8b5cf6', // Roxo
  '#10b981', // Verde
  '#f59e0b', // Âmbar
  '#ec4899', // Rosa
  '#6366f1', // Índigo
  '#14b8a6', // Teal
  '#f97316', // Laranja
  '#ef4444', // Vermelho
  '#84cc16'  // Lima
]

/**
 * Registra um novo usuário local
 */
export async function register(userData) {
  const { createUser, getUserByUsername } = useIndexedDB()
  
  try {
    authError.value = null
    isLoading.value = true

    // Validar dados
    if (!userData.username || userData.username.length < 3) {
      throw new Error('Nome de usuário deve ter pelo menos 3 caracteres')
    }

    // Verificar se username já existe
    const existingUser = await getUserByUsername(userData.username)
    if (existingUser) {
      throw new Error('Nome de usuário já está em uso')
    }

    // Preparar dados do usuário
    const user = {
      username: userData.username.toLowerCase().trim(),
      displayName: userData.displayName || userData.username,
      email: userData.email || '',
      avatarColor: userData.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      passwordHash: userData.password ? await hashPassword(userData.password) : null,
      hasPassword: !!userData.password,
      encryptionEnabled: userData.encryptionEnabled || false
    }

    // Criar usuário
    const newUser = await createUser(user)

    // Fazer login automático
    setCurrentUser(newUser)
    saveSession(newUser.id)

    return newUser
  } catch (error) {
    authError.value = error.message
    throw error
  } finally {
    isLoading.value = false
  }
}

/**
 * Faz login com usuário existente
 */
export async function login(username, password = null) {
  const { getUserByUsername, updateLastLogin } = useIndexedDB()
  
  try {
    authError.value = null
    isLoading.value = true

    const user = await getUserByUsername(username.toLowerCase().trim())

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar senha se necessário
    if (user.hasPassword) {
      if (!password) {
        throw new Error('Senha necessária')
      }

      const isValid = await verifyPassword(password, user.passwordHash)
      if (!isValid) {
        throw new Error('Senha incorreta')
      }
    }

    // Atualizar último login
    await updateLastLogin(user.id)

    setCurrentUser(user)
    saveSession(user.id)

    return user
  } catch (error) {
    authError.value = error.message
    throw error
  } finally {
    isLoading.value = false
  }
}

/**
 * Faz logout
 */
export function logout() {
  setCurrentUser(null)
  clearSession()
}

/**
 * Atualiza perfil do usuário
 */
export async function updateProfile(updates) {
  const { update } = useIndexedDB()
  
  try {
    if (!currentUser.value) {
      throw new Error('Usuário não autenticado')
    }

    const updatedUser = {
      ...currentUser.value,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    // Se estiver mudando senha
    if (updates.newPassword) {
      updatedUser.passwordHash = await hashPassword(updates.newPassword)
      updatedUser.hasPassword = true
    }

    await update('users', updatedUser)
    currentUser.value = updatedUser

    return updatedUser
  } catch (error) {
    authError.value = error.message
    throw error
  }
}

/**
 * Verifica senha atual
 */
export async function verifyCurrentPassword(password) {
  if (!currentUser.value?.passwordHash) return true
  return verifyPassword(password, currentUser.value.passwordHash)
}

/**
 * Remove conta do usuário
 */
export async function deleteAccount() {
  const { remove } = useIndexedDB()
  
  try {
    if (!currentUser.value) {
      throw new Error('Usuário não autenticado')
    }

    await remove('users', currentUser.value.id)
    logout()

    return true
  } catch (error) {
    authError.value = error.message
    throw error
  }
}

/**
 * Lista todos os perfis locais
 */
export async function listProfiles() {
  const { getAll } = useIndexedDB()
  
  try {
    const users = await getAll('users')
    return users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarColor: user.avatarColor,
      hasPassword: user.hasPassword,
      lastLogin: user.lastLogin
    }))
  } catch (error) {
    console.error('Erro ao listar perfis:', error)
    return []
  }
}

/**
 * Modo convidado (sem perfil)
 */
export function useGuestMode() {
  setCurrentUser({
    id: 'guest',
    username: 'guest',
    displayName: 'Convidado',
    avatarColor: '#6b7280',
    isGuest: true
  })

  // Não salva sessão para convidado
  clearSession()
}
