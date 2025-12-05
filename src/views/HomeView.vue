<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import AgendaTimeline from "@/components/agenda/AgendaTimeline.vue";
import TaskForm from "@/components/agenda/TaskForm.vue";
import DailyStats from "@/components/analytics/DailyStats.vue";

const router = useRouter();
const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

const showTaskForm = ref(false);
const editingTask = ref(null);
const selectedSlot = ref(null);

// Load data
onMounted(async () => {
  await Promise.all([
    timeStore.loadDayTasks(),
    timeStore.loadCategories(),
    settingsStore.loadSettings(),
  ]);
});

// Computed
const currentTime = computed(() => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
});

const tasksToday = computed(() => timeStore.tasks.length);
const completedToday = computed(() => timeStore.tasksByStatus.completed.length);
const inProgressTask = computed(() => timeStore.taskInProgress);

// Methods
function navigateDate(direction) {
  const date = new Date(timeStore.selectedDate);
  date.setDate(date.getDate() + direction);
  timeStore.setDate(date);
}

function goToToday() {
  timeStore.setDate(new Date());
}

function openTaskForm(slot = null) {
  selectedSlot.value = slot;
  editingTask.value = null;
  showTaskForm.value = true;
}

function editTask(task) {
  editingTask.value = task;
  selectedSlot.value = null;
  showTaskForm.value = true;
}

function closeTaskForm() {
  showTaskForm.value = false;
  editingTask.value = null;
  selectedSlot.value = null;
}

async function handleTaskSaved() {
  closeTaskForm();
  await timeStore.loadDayTasks();
}

function startTask(task) {
  router.push(`/execute/${task.id}`);
}

function continueTask() {
  if (inProgressTask.value) {
    router.push(`/execute/${inProgressTask.value.id}`);
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 pt-16"
  >
    <div class="max-w-7xl mx-auto p-4 lg:p-6">
      <!-- Header -->
      <div
        class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-white">
            {{ greeting }}! 👋
          </h1>
          <p class="text-gray-400 mt-1">
            {{ tasksToday }} tarefas para hoje • {{ completedToday }} concluídas
          </p>
        </div>

        <!-- Date Navigation -->
        <div class="flex items-center gap-2">
          <button
            @click="navigateDate(-1)"
            class="btn-premium btn-glass p-2 rounded-xl"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            @click="goToToday"
            class="btn-premium btn-outline-primary px-4 py-2 min-w-[160px] text-sm"
          >
            {{ settingsStore.formatDate(timeStore.selectedDate) }}
          </button>

          <button
            @click="navigateDate(1)"
            class="btn-premium btn-glass p-2 rounded-xl"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- In Progress Banner -->
      <div
        v-if="inProgressTask"
        class="mb-6 p-4 rounded-xl glass-card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 animate-pulse-glow"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
            >
              <span class="text-2xl">⏱️</span>
            </div>
            <div>
              <p class="text-sm text-amber-400 font-medium">Em andamento</p>
              <h3 class="font-semibold text-lg text-white">
                {{ inProgressTask.title }}
              </h3>
            </div>
          </div>
          <button
            @click="continueTask"
            class="btn-premium btn-gradient-warning px-4 py-2"
          >
            Continuar
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Timeline Column -->
        <div class="lg:col-span-3">
          <div class="glass-card overflow-hidden">
            <div
              class="p-4 border-b border-white/10 flex items-center justify-between bg-white/5"
            >
              <h2 class="font-semibold flex items-center gap-2 text-white">
                <span>📅</span>
                Agenda do Dia
              </h2>
              <button
                @click="openTaskForm()"
                class="btn-premium btn-gradient-primary px-4 py-2 text-sm"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
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
          <!-- Quick Stats -->
          <DailyStats />

          <!-- Quick Actions -->
          <div class="glass-card p-4">
            <h3 class="font-semibold mb-4 flex items-center gap-2 text-white">
              <span>⚡</span>
              Ações Rápidas
            </h3>

            <div class="space-y-2">
              <button
                @click="openTaskForm()"
                class="w-full btn-premium btn-glass justify-start px-3 py-2.5 text-sm"
              >
                <span class="mr-2">➕</span>
                Adicionar Tarefa
              </button>

              <button
                @click="router.push('/plan')"
                class="w-full btn-premium btn-glass justify-start px-3 py-2.5 text-sm"
              >
                <span class="mr-2">📋</span>
                Planejar Semana
              </button>

              <button
                @click="router.push('/review')"
                class="w-full btn-premium btn-glass justify-start px-3 py-2.5 text-sm"
              >
                <span class="mr-2">📊</span>
                Ver Análise
              </button>

              <button
                @click="router.push('/export')"
                class="w-full btn-premium btn-glass justify-start px-3 py-2.5 text-sm"
              >
                <span class="mr-2">📤</span>
                Exportar Dados
              </button>
            </div>
          </div>

          <!-- Categories Legend -->
          <div class="glass-card p-4">
            <h3 class="font-semibold mb-4 flex items-center gap-2 text-white">
              <span>🏷️</span>
              Categorias
            </h3>

            <div class="space-y-2">
              <div
                v-for="category in timeStore.categories"
                :key="category.id"
                class="flex items-center gap-3 text-sm text-gray-300"
              >
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: category.color }"
                />
                <span>{{ category.icon }} {{ category.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Form Modal -->
    <Teleport to="body">
      <div
        v-if="showTaskForm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="closeTaskForm"
        />
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
