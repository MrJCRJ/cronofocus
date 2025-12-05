/**
 * CronoFocus - Settings Store
 * Gerenciamento de configurações do usuário
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'
import { useAuthStore } from './authStore'

export const useSettingsStore = defineStore('settings', () => {
  const db = useIndexedDB()
  const authStore = useAuthStore()

  // Estado
  const settings = ref({
    timeInterval: 30,
    dayStartHour: 6,
    dayEndHour: 23,
    notificationsEnabled: true,
    soundEnabled: true,
    soundVolume: 0.3,
    reminderMinutes: 5,
    theme: 'dark',
    weekStartsOn: 0,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    showCompletedTasks: true,
    autoStartNext: false,
    showTimeEstimates: true,
    compactView: false
  })

  const loading = ref(false)
  const error = ref(null)

  // Getters
  const userId = computed(() => authStore.user?.id)

  const timeSlots = computed(() => {
    const slots = []
    const interval = settings.value.timeInterval

    for (let hour = settings.value.dayStartHour; hour <= settings.value.dayEndHour; hour++) {
      for (let min = 0; min < 60; min += interval) {
        slots.push({
          hour,
          minute: min,
          time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
          label: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        })
      }
    }

    return slots
  })

  const hoursInDay = computed(() => {
    return settings.value.dayEndHour - settings.value.dayStartHour + 1
  })

  // Actions
  async function loadSettings() {
    if (!userId.value) return

    try {
      loading.value = true
      error.value = null

      const userSettings = await db.getUserSettings(userId.value)
      settings.value = { ...settings.value, ...userSettings }

      // Aplicar tema
      applyTheme(settings.value.theme)
    } catch (err) {
      error.value = err.message
      console.error('Erro ao carregar configurações:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateSettings(updates) {
    if (!userId.value) return

    try {
      settings.value = { ...settings.value, ...updates }
      await db.updateUserSettings(userId.value, settings.value)

      // Aplicar tema se mudou
      if (updates.theme) {
        applyTheme(updates.theme)
      }

      // Salvar no localStorage para acesso rápido
      localStorage.setItem('cronofocus_settings', JSON.stringify(settings.value))
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function updateSetting(key, value) {
    return updateSettings({ [key]: value })
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  async function resetToDefaults() {
    const defaults = db.DEFAULT_SETTINGS
    return updateSettings(defaults)
  }

  function getTimeSlotIndex(time) {
    return timeSlots.value.findIndex(slot => slot.time === time)
  }

  function getNextTimeSlot(currentTime) {
    const currentIndex = getTimeSlotIndex(currentTime)
    if (currentIndex === -1 || currentIndex >= timeSlots.value.length - 1) {
      return timeSlots.value[0]?.time
    }
    return timeSlots.value[currentIndex + 1].time
  }

  function calculateDuration(startTime, endTime) {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)

    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    return endMinutes - startMinutes
  }

  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  function formatDate(date, format = null) {
    const d = new Date(date)
    const fmt = format || settings.value.dateFormat

    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()

    switch (fmt) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      default:
        return `${day}/${month}/${year}`
    }
  }

  function formatTime(time, format = null) {
    if (!time) return ''

    const [hours, minutes] = time.split(':').map(Number)
    const fmt = format || settings.value.timeFormat

    if (fmt === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM'
      const h = hours % 12 || 12
      return `${h}:${minutes.toString().padStart(2, '0')} ${period}`
    }

    return time
  }

  // Watch para salvar configurações quando mudam
  watch(
    () => authStore.user?.id,
    async (newUserId) => {
      if (newUserId) {
        await loadSettings()
      }
    }
  )

  // Carregar do localStorage para acesso rápido
  function loadFromLocalStorage() {
    const saved = localStorage.getItem('cronofocus_settings')
    if (saved) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(saved) }
        applyTheme(settings.value.theme)
      } catch (err) {
        console.error('Erro ao carregar configurações do localStorage:', err)
      }
    }
  }

  // Inicializar
  loadFromLocalStorage()

  return {
    // Estado
    settings,
    loading,
    error,

    // Getters
    timeSlots,
    hoursInDay,

    // Actions
    loadSettings,
    updateSettings,
    updateSetting,
    resetToDefaults,
    applyTheme,

    // Utilitários
    getTimeSlotIndex,
    getNextTimeSlot,
    calculateDuration,
    formatDuration,
    formatDate,
    formatTime
  }
})
