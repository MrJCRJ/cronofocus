<script setup>
/**
 * HomeView - Dashboard principal refatorado
 * Componentes: HomeHeader, QuickActions, InProgressBanner, CategoriesLegend
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTimeStore } from '@/stores/timeStore'
import { useSettingsStore } from '@/stores/settingsStore'

// Componentes
import AgendaTimeline from '@/components/agenda/AgendaTimeline.vue'
import TaskForm from '@/components/agenda/TaskForm.vue'
import DailyStats from '@/components/analytics/DailyStats.vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import QuickActions from '@/components/home/QuickActions.vue'
import InProgressBanner from '@/components/home/InProgressBanner.vue'
import CategoriesLegend from '@/components/home/CategoriesLegend.vue'

const router = useRouter()
const timeStore = useTimeStore()
const settingsStore = useSettingsStore()

// Estado local
const showTaskForm = ref(false)
const editingTask = ref(null)
const selectedSlot = ref(null)

// Carrega dados na montagem
onMounted(async () => {
  await Promise.all([
    timeStore.loadDayTasks(),
    timeStore.loadCategories(),
    settingsStore.loadSettings()
  ])
})

// Computed
const tasksToday = computed(() => timeStore.tasks.length)
const completedToday = computed(() => timeStore.tasksByStatus.completed.length)
const inProgressTask = computed(() => timeStore.taskInProgress)

// Navegação de data
function navigateDate(direction) {
  const date = new Date(timeStore.selectedDate)
  date.setDate(date.getDate() + direction)
  timeStore.setDate(date)
}

function goToToday() {
  timeStore.setDate(new Date())
}

// TaskForm handlers
function openTaskForm(slot = null) {
  selectedSlot.value = slot
  editingTask.value = null
  showTaskForm.value = true
}

function editTask(task) {
  editingTask.value = task
  selectedSlot.value = null
  showTaskForm.value = true
}

function closeTaskForm() {
  showTaskForm.value = false
  editingTask.value = null
  selectedSlot.value = null
}

async function handleTaskSaved() {
  closeTaskForm()
  await timeStore.loadDayTasks()
}

// Navegação de tarefas
function startTask(task) {
  router.push(`/execute/${task.id}`)
}

function continueTask() {
  if (inProgressTask.value) {
    router.push(`/execute/${inProgressTask.value.id}`)
  }
}

// Navegação rápida
function goToPlan() {
  router.push('/plan')
}

function goToReview() {
  router.push('/review')
}

function goToExport() {
  router.push('/export')
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-gray-800 pt-16">
    <div class="max-w-7xl mx-auto p-4 lg:p-6">
      <!-- Header -->
      <HomeHeader
        :selected-date="timeStore.selectedDate"
        :tasks-today="tasksToday"
        :completed-today="completedToday"
        :format-date="settingsStore.formatDate"
        @navigate-date="navigateDate"
        @go-today="goToToday"
      />

      <!-- In Progress Banner -->
      <InProgressBanner
        v-if="inProgressTask"
        :task="inProgressTask"
        @continue="continueTask"
      />

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Timeline Column -->
        <div class="lg:col-span-3">
          <div class="glass-card overflow-hidden">
            <div class="p-4 flex items-center justify-between bg-white/5">
              <h2 class="font-semibold flex items-center gap-2 text-white">
                <span>📅</span>
                Agenda do Dia
              </h2>
              <button
                @click="openTaskForm()"
                class="btn-premium btn-gradient-primary px-4 py-2 text-sm"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nova Tarefa
              </button>
            </div>

            <AgendaTimeline
              @slot-click="openTaskForm"
              @task-click="editTask"
              @task-start="startTask"
            />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <DailyStats />

          <QuickActions
            @add-task="openTaskForm()"
            @plan="goToPlan"
            @review="goToReview"
            @export="goToExport"
          />

          <CategoriesLegend :categories="timeStore.categories" />
        </div>
      </div>
    </div>

    <!-- Task Form Modal -->
    <Teleport to="body">
      <div v-if="showTaskForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeTaskForm" />
        <div class="relative w-full max-w-lg animate-slide-up">
          <TaskForm
            :editing="editingTask"
            :initial-slot="selectedSlot"
            @saved="handleTaskSaved"
            @cancel="closeTaskForm"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
