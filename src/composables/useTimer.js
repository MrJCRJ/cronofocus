/**
 * CronoFocus - Timer Composable
 * Timer preciso usando Web Worker para funcionamento em segundo plano
 */

import { ref, computed, readonly, onUnmounted } from 'vue'

// Estado global do timer
const isRunning = ref(false)
const isPaused = ref(false)
const remainingSeconds = ref(0)
const totalSeconds = ref(0)
const elapsedSeconds = ref(0)
const currentTaskId = ref(null)

// Web Worker
let timerWorker = null

/**
 * Código do Web Worker (inline)
 */
const workerCode = `
let timerInterval = null;
let remainingTime = 0;
let isRunning = false;

self.onmessage = function(e) {
  const { command, time } = e.data;
  
  switch(command) {
    case 'start':
      remainingTime = time;
      isRunning = true;
      startTimer();
      break;
      
    case 'pause':
      isRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      self.postMessage({ type: 'paused', time: remainingTime });
      break;
      
    case 'resume':
      isRunning = true;
      startTimer();
      break;
      
    case 'reset':
      isRunning = false;
      remainingTime = time;
      if (timerInterval) clearInterval(timerInterval);
      self.postMessage({ type: 'reset', time: remainingTime });
      break;
      
    case 'stop':
      isRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      self.postMessage({ type: 'stopped', time: remainingTime });
      break;
      
    case 'add':
      remainingTime += time;
      self.postMessage({ type: 'update', time: remainingTime });
      break;
  }
};

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (!isRunning) return;
    
    remainingTime--;
    
    self.postMessage({ 
      type: 'update', 
      time: remainingTime 
    });
    
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      self.postMessage({ type: 'finished' });
    }
    
    // Notificar a cada minuto
    if (remainingTime > 0 && remainingTime % 60 === 0) {
      self.postMessage({ 
        type: 'minute', 
        minutes: remainingTime / 60 
      });
    }
    
    // Avisos de tempo
    if (remainingTime === 300) { // 5 minutos
      self.postMessage({ type: 'warning', minutes: 5 });
    } else if (remainingTime === 60) { // 1 minuto
      self.postMessage({ type: 'warning', minutes: 1 });
    }
  }, 1000);
}
`;

// Callbacks
let onUpdate = null
let onFinished = null
let onMinute = null
let onWarning = null

/**
 * Cria o Web Worker
 */
function createWorker() {
  if (timerWorker) {
    timerWorker.terminate()
  }

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(blob)
  timerWorker = new Worker(workerUrl)

  timerWorker.onmessage = (e) => {
    const { type, time, minutes } = e.data

    switch (type) {
      case 'update':
        remainingSeconds.value = time
        elapsedSeconds.value = totalSeconds.value - time
        if (onUpdate) onUpdate(time)
        break

      case 'finished':
        isRunning.value = false
        isPaused.value = false
        remainingSeconds.value = 0
        if (onFinished) onFinished()
        break

      case 'paused':
        isPaused.value = true
        remainingSeconds.value = time
        break

      case 'reset':
        remainingSeconds.value = time
        elapsedSeconds.value = 0
        break

      case 'stopped':
        isRunning.value = false
        isPaused.value = false
        break

      case 'minute':
        if (onMinute) onMinute(minutes)
        break

      case 'warning':
        if (onWarning) onWarning(minutes)
        break
    }
  }

  timerWorker.onerror = (error) => {
    console.error('Timer Worker Error:', error)
  }

  URL.revokeObjectURL(workerUrl)
}

/**
 * Composable do Timer
 */
export function useTimer() {
  // Garante que o worker existe
  if (!timerWorker) {
    createWorker()
  }

  /**
   * Inicia o timer
   * @param {number} seconds - Duração em segundos
   * @param {string} taskId - ID da tarefa (opcional)
   */
  function start(seconds, taskId = null) {
    if (!timerWorker) createWorker()

    totalSeconds.value = seconds
    remainingSeconds.value = seconds
    elapsedSeconds.value = 0
    currentTaskId.value = taskId
    isRunning.value = true
    isPaused.value = false

    timerWorker.postMessage({ command: 'start', time: seconds })
  }

  /**
   * Inicia timer em minutos
   */
  function startMinutes(minutes, taskId = null) {
    start(minutes * 60, taskId)
  }

  /**
   * Pausa o timer
   */
  function pause() {
    if (!isRunning.value || isPaused.value) return

    isPaused.value = true
    timerWorker.postMessage({ command: 'pause' })
  }

  /**
   * Retoma o timer
   */
  function resume() {
    if (!isPaused.value) return

    isPaused.value = false
    isRunning.value = true
    timerWorker.postMessage({ command: 'resume' })
  }

  /**
   * Para o timer
   */
  function stop() {
    isRunning.value = false
    isPaused.value = false
    timerWorker.postMessage({ command: 'stop' })
  }

  /**
   * Reseta o timer
   * @param {number} seconds - Nova duração (opcional, usa a original se não especificada)
   */
  function reset(seconds = null) {
    const time = seconds || totalSeconds.value
    totalSeconds.value = time
    remainingSeconds.value = time
    elapsedSeconds.value = 0
    isRunning.value = false
    isPaused.value = false

    timerWorker.postMessage({ command: 'reset', time })
  }

  /**
   * Adiciona tempo ao timer
   */
  function addTime(seconds) {
    totalSeconds.value += seconds
    timerWorker.postMessage({ command: 'add', time: seconds })
  }

  /**
   * Adiciona minutos ao timer
   */
  function addMinutes(minutes) {
    addTime(minutes * 60)
  }

  /**
   * Define callbacks
   */
  function setCallbacks(callbacks) {
    if (callbacks.onUpdate) onUpdate = callbacks.onUpdate
    if (callbacks.onFinished) onFinished = callbacks.onFinished
    if (callbacks.onMinute) onMinute = callbacks.onMinute
    if (callbacks.onWarning) onWarning = callbacks.onWarning
  }

  /**
   * Limpa callbacks
   */
  function clearCallbacks() {
    onUpdate = null
    onFinished = null
    onMinute = null
    onWarning = null
  }

  // Computed properties
  const progress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return ((totalSeconds.value - remainingSeconds.value) / totalSeconds.value) * 100
  })

  const remainingMinutes = computed(() => Math.floor(remainingSeconds.value / 60))

  const remainingSecondsOnly = computed(() => remainingSeconds.value % 60)

  const formattedTime = computed(() => {
    const hours = Math.floor(remainingSeconds.value / 3600)
    const minutes = Math.floor((remainingSeconds.value % 3600) / 60)
    const seconds = remainingSeconds.value % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const formattedElapsed = computed(() => {
    const hours = Math.floor(elapsedSeconds.value / 3600)
    const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
    const seconds = elapsedSeconds.value % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const elapsedMinutes = computed(() => Math.floor(elapsedSeconds.value / 60))

  // Cleanup ao desmontar
  onUnmounted(() => {
    // Não terminamos o worker aqui pois é global
    // Apenas limpamos os callbacks deste componente
    clearCallbacks()
  })

  return {
    // Estado
    isRunning: readonly(isRunning),
    isPaused: readonly(isPaused),
    remainingSeconds: readonly(remainingSeconds),
    totalSeconds: readonly(totalSeconds),
    elapsedSeconds: readonly(elapsedSeconds),
    currentTaskId: readonly(currentTaskId),

    // Computed
    progress,
    remainingMinutes,
    remainingSecondsOnly,
    formattedTime,
    formattedElapsed,
    elapsedMinutes,

    // Métodos
    start,
    startMinutes,
    pause,
    resume,
    stop,
    reset,
    addTime,
    addMinutes,
    setCallbacks,
    clearCallbacks
  }
}

/**
 * Formata segundos para string legível
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  if (minutes > 0) {
    return `${minutes}min ${secs}s`
  }
  return `${secs}s`
}

/**
 * Formata minutos para string legível
 */
export function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }
  return `${mins}min`
}
