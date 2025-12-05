/**
 * CronoFocus - Auth Crypto Module
 * Funções de criptografia e hash de senhas
 */

const SALT = 'cronofocus-salt'

/**
 * Hash simples para senha (não usar em produção real!)
 * Em produção, usar bcrypt ou similar no servidor
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + SALT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verifica se a senha corresponde ao hash
 */
export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Deriva chave de criptografia a partir de senha
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

/**
 * Criptografa dados sensíveis com AES-GCM
 */
export async function encryptData(data, password) {
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

/**
 * Descriptografa dados criptografados com AES-GCM
 */
export async function decryptData(encryptedObj, password) {
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
