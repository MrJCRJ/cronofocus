/**
 * CronoFocus - Notifications Push Module
 * Sistema de notificações push e locais
 */

import { ref, readonly } from 'vue'
import { playSound } from './audio'

// Estado global
export const permissionStatus = ref('default')
export const isSupported = ref(false)
export const subscription = ref(null)

/**
 * Inicializa o sistema de notificações
 */
export function initNotifications() {
  isSupported.value = 'Notification' in window && 'serviceWorker' in navigator

  if (isSupported.value) {
    permissionStatus.value = Notification.permission
  }
}

/**
 * Solicita permissão para notificações
 */
export async function requestPermission() {
  if (!isSupported.value) {
    console.warn('Notificações não são suportadas neste navegador')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    permissionStatus.value = permission

    if (permission === 'granted') {
      // Registrar service worker se ainda não estiver
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready

        // Tentar subscrever para push (se VAPID key disponível)
        try {
          const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
          if (vapidKey) {
            subscription.value = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: vapidKey
            })
          }
        } catch (pushError) {
          console.log('Push subscription não disponível:', pushError.message)
        }
      }

      return true
    }

    return false
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error)
    return false
  }
}

/**
 * Envia notificação local
 */
export async function notify(options) {
  const {
    title,
    body,
    icon = '/icons/icon-192x192.png',
    badge = '/icons/badge-72x72.png',
    tag,
    data,
    sound,
    requireInteraction = false,
    actions = []
  } = options

  // Tocar som se especificado
  if (sound) {
    const settings = JSON.parse(localStorage.getItem('cronofocus_settings') || '{}')
    if (settings.soundEnabled !== false) {
      await playSound(sound, settings.soundVolume || 0.3)
    }
  }

  // Verificar permissão
  if (permissionStatus.value !== 'granted') {
    console.log('Notificações não permitidas')
    return null
  }

  try {
    // Usar Service Worker se disponível (melhor para PWA)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        body,
        icon,
        badge,
        tag,
        data,
        requireInteraction,
        actions,
        vibrate: [100, 50, 100]
      })
    } else {
      // Fallback para Notification API básica
      new Notification(title, {
        body,
        icon,
        tag,
        data
      })
    }
  } catch (error) {
    console.error('Erro ao mostrar notificação:', error)
  }
}

/**
 * Cancela notificações agendadas para uma tag
 */
export async function cancelNotification(tag) {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    const notifications = await registration.getNotifications({ tag })
    notifications.forEach(notification => notification.close())
  }
}

/**
 * Cancela todas as notificações
 */
export async function cancelAllNotifications() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    const notifications = await registration.getNotifications()
    notifications.forEach(notification => notification.close())
  }
}

/**
 * Estado readonly para consumo externo
 */
export const readonlyState = {
  permissionStatus: readonly(permissionStatus),
  isSupported: readonly(isSupported),
  subscription: readonly(subscription)
}
