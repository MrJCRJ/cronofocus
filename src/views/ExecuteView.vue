<script setup>
/**
 * ExecuteView - Timer de execução refatorado
 * Componentes: TimerDisplay, TimerControls, SessionStats, DistractionModal, CompletionModal
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTimeStore } from '@/stores/timeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTimer } from '@/composables/useTimer'
import { useNotifications } from '@/composables/useNotifications'

// Componentes
import TimerDisplay from '@/components/execute/TimerDisplay.vue'
import TimerControls from '@/components/execute/TimerControls.vue'
import SessionStats from '@/components/execute/SessionStats.vue'
import DistractionModal from '@/components/execute/DistractionModal.vue'
import CompletionModal from '@/components/execute/CompletionModal.vue'

const router = useRouter()
const route = useRoute()
const timeStore = useTimeStore()
const settingsStore = useSettingsStore()
const timer = useTimer()
const notifications = useNotifications()

// Estado
const task = ref(null)
const showDistractionModal = ref(false)
const showCompletionModal = ref(false)

// Lifecycle
onMounted(async () => {
  await timeStore.loadDayTasks()

  if (route.params.taskId) {
    task.value = timeStore.tasks.find(t => t.id === route.params.taskId)

    if (task.value && task.value.status === 'planned') {
      await timeStore.startTask(task.value.id)
      task.value = timeStore.tasks.find(t => t.id === route.params.taskId)
      startTimer()
    } else if (task.value && task.value.status === 'in-progress') {
      resumeTimer()
    }
  } else {
    task.value = timeStore.taskInProgress
    if (task.value) {
      resumeTimer()
    }
  }

  timer.setCallbacks({
    onFinished: handleTimerFinished,
    onWarning: handleWarning
  })

  notifications.init()
})

onUnmounted(() => {
  timer.clearCallbacks()
})

// Computed
const category = computed(() => {
  if (!task.value) return null
  return timeStore.categories.find(c => c.id === task.value.category) || {
    name: 'Tarefa',
    color: '#6b7280',
    icon: '📌'
  }
})

const distractionCount = computed(() => task.value?.distractions?.length || 0)

// Timer methods
function startTimer() {
  if (!task.value) return
  const duration = task.value.plannedDuration || 30
  timer.startMinutes(duration)
}

function resumeTimer() {
  if (!task.value || !task.value.actualStart) return

  const startTime = new Date(task.value.actualStart)
  const now = new Date()
  const elapsedSeconds = Math.floor((now - startTime) / 1000)
  const plannedSeconds = (task.value.plannedDuration || 30) * 60
  const remainingSeconds = Math.max(0, plannedSeconds - elapsedSeconds)

  if (remainingSeconds > 0) {
    timer.start(remainingSeconds, task.value.id)
  } else {
    handleTimerFinished()
  }
}

function toggleTimer() {
  if (timer.isPaused.value) {
    timer.resume()
  } else {
    timer.pause()
  }
}

async function handleTimerFinished() {
  await notifications.notifyTimerEnd(task.value)
  notifications.playSound('timerEnd')
  showCompletionModal.value = true
}

function handleWarning(minutes) {
  notifications.playSound('taskReminder')
}

function addMoreTime(minutes) {
  timer.addMinutes(minutes)
}

// Distraction handling
async function handleDistraction(note) {
  if (!task.value) return

  await timeStore.addDistraction(task.value.id, {
    note: note,
    duration: null
  })

  showDistractionModal.value = false
}

// Completion handling
async function handleComplete({ rating, notes }) {
  if (!task.value) return

  timer.stop()

  await timeStore.completeTask(task.value.id, {
    rating,
    completionNotes: notes,
    actualDuration: timer.elapsedMinutes.value
  })

  await notifications.notifyTaskComplete(task.value, {
    duration: timer.elapsedMinutes.value
  })

  showCompletionModal.value = false
  router.push('/home')
}

async function skipTask() {
  if (!task.value) return

  timer.stop()
  await timeStore.skipTask(task.value.id, 'Pulada durante execução')
  showCompletionModal.value = false
  router.push('/home')
}

function goToHome() {
  router.push('/home')
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 pt-16">
    <!-- No Task State -->
    <div v-if="!task" class="min-h-dvh flex items-center justify-center">
      <div class="glass-card p-12 text-center max-w-md animate-fade-in">
        <div class="text-7xl mb-6 animate-pulse-glow">⏱️</div>
        <h2 class="text-2xl font-bold mb-3 text-white">
          Nenhuma tarefa em execução
        </h2>
        <p class="text-gray-400 mb-8">
          Selecione uma tarefa na agenda para começar seu foco
        </p>
        <button
          @click="goToHome"
          class="btn-premium btn-gradient-primary px-8 py-3"
        >
          <span class="mr-2">📅</span>
          Ir para Agenda
        </button>
      </div>
    </div>

    <!-- Timer View -->
    <div v-else class="focus-timer">
      <!-- Task Info -->
      <div class="text-center mb-10 animate-fade-in">
        <div
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm mb-5 glass-card"
          :style="{
            backgroundColor: category?.color + '25',
            borderColor: category?.color + '50',
            color: category?.color
          }"
        >
          <span class="text-lg">{{ category?.icon }}</span>
          <span class="font-medium">{{ category?.name }}</span>
        </div>

        <h1 class="text-3xl lg:text-5xl font-bold mb-3 text-white">
          {{ task.title }}
        </h1>

        <p class="text-gray-400">
          <span class="font-medium">{{ task.plannedStart }}</span>
          <span class="mx-2">→</span>
          <span class="font-medium">{{ task.plannedEnd }}</span>
          <span v-if="task.description" class="block mt-2 text-sm opacity-75">
            {{ task.description }}
          </span>
        </p>
      </div>

      <!-- Timer Ring -->
      <TimerDisplay
        :formatted-time="timer.formattedTime.value"
        :progress="timer.progress.value"
        :is-paused="timer.isPaused.value"
        :color="category?.color || '#6366f1'"
      />

      <!-- Controls -->
      <TimerControls
        :is-paused="timer.isPaused.value"
        :distraction-count="distractionCount"
        @toggle="toggleTimer"
        @complete="showCompletionModal = true"
        @skip="skipTask"
        @add-time="addMoreTime"
        @distraction="showDistractionModal = true"
      />

      <!-- Stats -->
      <div class="mt-10">
        <SessionStats
          :elapsed-minutes="timer.elapsedMinutes.value"
          :planned-minutes="task.plannedDuration || 0"
          :distraction-count="distractionCount"
        />
      </div>
    </div>

    <!-- Modals -->
    <DistractionModal
      :visible="showDistractionModal"
      @close="showDistractionModal = false"
      @submit="handleDistraction"
    />

    <CompletionModal
      :visible="showCompletionModal"
      :elapsed-minutes="timer.elapsedMinutes.value"
      :planned-minutes="task?.plannedDuration || 0"
      :distraction-count="distractionCount"
      :formatted-elapsed="timer.formattedElapsed.value"
      @complete="handleComplete"
      @skip="skipTask"
    />
  </div>
</template>

<style scoped>
.focus-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
}
</style>
