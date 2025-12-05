/**
 * CronoFocus - Auth Composable
 * Sistema de autenticação local com criptografia opcional
 */

import { ref, computed, readonly } from 'vue'
import { useIndexedDB } from './useIndexedDB'

// Estado global de autenticação
const currentUser = ref(null)
const isAuthenticated = ref(false)
const isLoading = ref(true)
const authError = ref(null)

// Cores de avatar disponíveis
const AVATAR_COLORS = [
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
 * Hash simples para senha (não usar em produção real!)
 * Em produção, usar bcrypt ou similar no servidor
 */
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'cronofocus-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Criptografia de dados sensíveis (opcional)
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptData(data, password) {
  try {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(JSON.stringify(data))
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await deriveKey(password, salt)

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    )

    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      salt: Array.from(salt)
    }
  } catch (error) {
    console.error('Erro ao criptografar:', error)
    throw error
  }
}

async function decryptData(encryptedObj, password) {
  try {
    const salt = new Uint8Array(encryptedObj.salt)
    const iv = new Uint8Array(encryptedObj.iv)
    const encrypted = new Uint8Array(encryptedObj.encrypted)
    const key = await deriveKey(password, salt)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )

    const decoder = new TextDecoder()
    return JSON.parse(decoder.decode(decrypted))
  } catch (error) {
    console.error('Erro ao descriptografar:', error)
    throw new Error('Senha incorreta ou dados corrompidos')
  }
}

/**
 * Composable de autenticação
 */
export function useAuth() {
  const {
    initDB,
    createUser,
    getUserByUsername,
    updateLastLogin,
    get,
    update,
    getAll,
    remove
  } = useIndexedDB()

  /**
   * Inicializa o sistema de autenticação
   */
  async function initAuth() {
    try {
      isLoading.value = true
      await initDB()

      // Verificar se há sessão salva
      const savedSession = localStorage.getItem('cronofocus_session')
      if (savedSession) {
        const session = JSON.parse(savedSession)
        const user = await get('users', session.userId)

        if (user) {
          currentUser.value = user
          isAuthenticated.value = true
          await updateLastLogin(user.id)
        } else {
          // Sessão inválida, limpar
          localStorage.removeItem('cronofocus_session')
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar auth:', error)
      authError.value = error.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Registra um novo usuário local
   */
  async function register(userData) {
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
      currentUser.value = newUser
      isAuthenticated.value = true

      // Salvar sessão
      localStorage.setItem('cronofocus_session', JSON.stringify({
        userId: newUser.id,
        timestamp: Date.now()
      }))

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
  async function login(username, password = null) {
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

      currentUser.value = user
      isAuthenticated.value = true

      // Salvar sessão
      localStorage.setItem('cronofocus_session', JSON.stringify({
        userId: user.id,
        timestamp: Date.now()
      }))

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
  function logout() {
    currentUser.value = null
    isAuthenticated.value = false
    localStorage.removeItem('cronofocus_session')
  }

  /**
   * Atualiza perfil do usuário
   */
  async function updateProfile(updates) {
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
  async function verifyCurrentPassword(password) {
    if (!currentUser.value?.passwordHash) return true
    return verifyPassword(password, currentUser.value.passwordHash)
  }

  /**
   * Remove conta do usuário
   */
  async function deleteAccount() {
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
  async function listProfiles() {
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
  async function useGuestMode() {
    currentUser.value = {
      id: 'guest',
      username: 'guest',
      displayName: 'Convidado',
      avatarColor: '#6b7280',
      isGuest: true
    }
    isAuthenticated.value = true

    // Não salva sessão para convidado
    localStorage.removeItem('cronofocus_session')
  }

  // Computed properties
  const userInitials = computed(() => {
    if (!currentUser.value?.displayName) return '?'
    return currentUser.value.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  })

  const isGuest = computed(() => currentUser.value?.isGuest || false)

  return {
    // Estado
    currentUser: readonly(currentUser),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    authError: readonly(authError),

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
