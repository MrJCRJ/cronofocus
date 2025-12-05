<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimer, formatMinutes } from "@/composables/useTimer";
import { useNotifications } from "@/composables/useNotifications";

const router = useRouter();
const route = useRoute();
const timeStore = useTimeStore();
const settingsStore = useSettingsStore();
const timer = useTimer();
const notifications = useNotifications();

const task = ref(null);
const showDistractionModal = ref(false);
const showCompletionModal = ref(false);
const distractionNote = ref("");
const completionRating = ref(3);
const completionNotes = ref("");

// Load task from route params or find in-progress task
onMounted(async () => {
  await timeStore.loadDayTasks();

  if (route.params.taskId) {
    task.value = timeStore.tasks.find((t) => t.id === route.params.taskId);

    if (task.value && task.value.status === "planned") {
      // Start the task
      await timeStore.startTask(task.value.id);
      task.value = timeStore.tasks.find((t) => t.id === route.params.taskId);
      startTimer();
    } else if (task.value && task.value.status === "in-progress") {
      // Resume existing task
      resumeTimer();
    }
  } else {
    // Find any in-progress task
    task.value = timeStore.taskInProgress;
    if (task.value) {
      resumeTimer();
    }
  }

  // Set up timer callbacks
  timer.setCallbacks({
    onFinished: handleTimerFinished,
    onWarning: handleWarning,
  });

  // Initialize notifications
  notifications.init();
});

onUnmounted(() => {
  timer.clearCallbacks();
});

// Timer methods
function startTimer() {
  if (!task.value) return;
  const duration = task.value.plannedDuration || 30;
  timer.startMinutes(duration);
}

function resumeTimer() {
  if (!task.value || !task.value.actualStart) return;

  const startTime = new Date(task.value.actualStart);
  const now = new Date();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  const plannedSeconds = (task.value.plannedDuration || 30) * 60;
  const remainingSeconds = Math.max(0, plannedSeconds - elapsedSeconds);

  if (remainingSeconds > 0) {
    timer.start(remainingSeconds, task.value.id);
  } else {
    // Timer already expired
    handleTimerFinished();
  }
}

function toggleTimer() {
  if (timer.isPaused.value) {
    timer.resume();
  } else {
    timer.pause();
  }
}

async function handleTimerFinished() {
  await notifications.notifyTimerEnd(task.value);
  notifications.playSound("timerEnd");
  showCompletionModal.value = true;
}

function handleWarning(minutes) {
  notifications.playSound("taskReminder");
}

function addMoreTime(minutes) {
  timer.addMinutes(minutes);
}

// Distraction handling
async function logDistraction() {
  if (!task.value || !distractionNote.value.trim()) return;

  await timeStore.addDistraction(task.value.id, {
    note: distractionNote.value.trim(),
    duration: null, // Could track duration later
  });

  distractionNote.value = "";
  showDistractionModal.value = false;
}

// Completion handling
async function completeTask() {
  if (!task.value) return;

  timer.stop();

  await timeStore.completeTask(task.value.id, {
    rating: completionRating.value,
    completionNotes: completionNotes.value,
    actualDuration: timer.elapsedMinutes.value,
  });

  await notifications.notifyTaskComplete(task.value, {
    duration: timer.elapsedMinutes.value,
  });

  showCompletionModal.value = false;
  router.push("/home");
}

async function skipTask() {
  if (!task.value) return;

  timer.stop();
  await timeStore.skipTask(task.value.id, "Pulada durante execução");
  router.push("/home");
}

// Computed
const category = computed(() => {
  if (!task.value) return null;
  return (
    timeStore.categories.find((c) => c.id === task.value.category) || {
      name: "Tarefa",
      color: "#6b7280",
      icon: "📌",
    }
  );
});

const progressPercent = computed(() => timer.progress.value);

const ringCircumference = 2 * Math.PI * 140; // radius = 140
const ringOffset = computed(() => {
  return ringCircumference - (progressPercent.value / 100) * ringCircumference;
});

const distractionCount = computed(() => task.value?.distractions?.length || 0);
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 pt-16"
  >
    <!-- No Task State -->
    <div v-if="!task" class="min-h-[80vh] flex items-center justify-center">
      <div class="glass-card p-12 text-center max-w-md animate-fade-in">
        <div class="text-7xl mb-6 animate-pulse-glow">⏱️</div>
        <h2 class="text-2xl font-bold mb-3 text-white">
          Nenhuma tarefa em execução
        </h2>
        <p class="text-gray-400 mb-8">
          Selecione uma tarefa na agenda para começar seu foco
        </p>
        <button
          @click="router.push('/home')"
          class="btn-premium btn-primary px-8 py-3"
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
            color: category?.color,
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
      <div class="timer-ring relative mb-10">
        <svg viewBox="0 0 300 300" class="w-full h-full drop-shadow-2xl">
          <!-- Background ring -->
          <circle cx="150" cy="150" r="140" class="timer-ring-bg" />
          <!-- Progress ring -->
          <circle
            cx="150"
            cy="150"
            r="140"
            class="timer-ring-progress"
            :style="{
              strokeDasharray: ringCircumference,
              strokeDashoffset: ringOffset,
              stroke: category?.color || '#6366f1',
              filter: `drop-shadow(0 0 20px ${category?.color || '#6366f1'}60)`,
            }"
          />
        </svg>

        <!-- Timer Display -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="timer-display text-white">
            {{ timer.formattedTime.value }}
          </div>
          <div class="text-gray-400 text-sm font-medium">
            {{ timer.isPaused.value ? "⏸ Pausado" : "⏱ Restante" }}
          </div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center gap-5 mb-10">
        <button
          @click="toggleTimer"
          class="btn-premium w-16 h-16 rounded-full flex items-center justify-center"
          :class="timer.isPaused.value ? 'btn-success' : 'btn-warning'"
        >
          <span class="text-3xl">{{ timer.isPaused.value ? "▶️" : "⏸️" }}</span>
        </button>

        <button
          @click="showCompletionModal = true"
          class="btn-premium btn-success w-16 h-16 rounded-full flex items-center justify-center"
        >
          <span class="text-3xl">✅</span>
        </button>

        <button
          @click="skipTask"
          class="btn-premium btn-danger w-16 h-16 rounded-full flex items-center justify-center"
        >
          <span class="text-3xl">⏭️</span>
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap justify-center gap-3 mb-10">
        <button
          @click="addMoreTime(5)"
          class="btn-premium btn-glass px-4 py-2 text-sm"
        >
          <span class="mr-1">⏰</span> +5 min
        </button>
        <button
          @click="addMoreTime(10)"
          class="btn-premium btn-glass px-4 py-2 text-sm"
        >
          <span class="mr-1">⏰</span> +10 min
        </button>
        <button
          @click="showDistractionModal = true"
          class="btn-premium btn-warning px-4 py-2 text-sm"
        >
          🚨 Distração
          <span
            v-if="distractionCount > 0"
            class="ml-2 px-2 py-0.5 bg-amber-500/30 rounded-full text-xs font-bold"
          >
            {{ distractionCount }}
          </span>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 max-w-lg w-full">
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-primary">
            {{ timer.elapsedMinutes.value }}
          </div>
          <div class="text-xs text-gray-400 mt-1">min decorridos</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-white">
            {{ task.plannedDuration || 0 }}
          </div>
          <div class="text-xs text-gray-400 mt-1">min planejados</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-amber-400">
            {{ distractionCount }}
          </div>
          <div class="text-xs text-gray-400 mt-1">distrações</div>
        </div>
      </div>
    </div>

    <!-- Distraction Modal -->
    <Teleport to="body">
      <div
        v-if="showDistractionModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showDistractionModal = false"
        />
        <div class="relative glass-card p-6 w-full max-w-md animate-slide-up">
          <h3
            class="text-lg font-semibold mb-4 text-white flex items-center gap-2"
          >
            <span>🚨</span>
            Registrar Distração
          </h3>

          <textarea
            v-model="distractionNote"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 mb-4"
            rows="3"
            placeholder="O que te interrompeu?"
            autofocus
          />

          <div class="flex gap-3 justify-end">
            <button
              @click="showDistractionModal = false"
              class="btn-premium btn-glass px-5 py-2.5"
            >
              Cancelar
            </button>
            <button
              @click="logDistraction"
              class="btn-premium btn-warning px-5 py-2.5"
              :disabled="!distractionNote.trim()"
            >
              Registrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Completion Modal -->
    <Teleport to="body">
      <div
        v-if="showCompletionModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div class="relative glass-card p-8 w-full max-w-md animate-slide-up">
          <div class="text-center mb-8">
            <div class="text-7xl mb-4 animate-bounce">🎉</div>
            <h3 class="text-3xl font-bold mb-2 text-white">
              Tarefa Concluída!
            </h3>
            <p class="text-gray-400">
              {{ timer.formattedElapsed.value }} de foco total
            </p>
          </div>

          <!-- Rating -->
          <div class="mb-8">
            <label
              class="block text-sm font-medium mb-4 text-center text-gray-300"
            >
              Como foi sua sessão?
            </label>
            <div class="flex justify-center gap-3">
              <button
                v-for="i in 5"
                :key="i"
                @click="completionRating = i"
                :class="[
                  'text-4xl transition-all duration-300 hover:scale-125',
                  i <= completionRating
                    ? 'opacity-100 scale-110 drop-shadow-lg'
                    : 'opacity-40 grayscale hover:opacity-70',
                ]"
              >
                ⭐
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-8">
            <label class="block text-sm font-medium mb-2 text-gray-300">
              Notas (opcional)
            </label>
            <textarea
              v-model="completionNotes"
              class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              rows="2"
              placeholder="O que você realizou? Alguma observação?"
            />
          </div>

          <!-- Summary -->
          <div class="glass-card bg-white/5 p-5 mb-8">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500 text-xs uppercase tracking-wide"
                  >Tempo Real</span
                >
                <p class="font-bold text-lg text-white mt-1">
                  {{ formatMinutes(timer.elapsedMinutes.value) }}
                </p>
              </div>
              <div>
                <span class="text-gray-500 text-xs uppercase tracking-wide"
                  >Planejado</span
                >
                <p class="font-bold text-lg text-white mt-1">
                  {{ formatMinutes(task?.plannedDuration || 0) }}
                </p>
              </div>
              <div>
                <span class="text-gray-500 text-xs uppercase tracking-wide"
                  >Distrações</span
                >
                <p
                  class="font-bold text-lg mt-1"
                  :class="
                    distractionCount > 0 ? 'text-amber-400' : 'text-white'
                  "
                >
                  {{ distractionCount }}
                </p>
              </div>
              <div>
                <span class="text-gray-500 text-xs uppercase tracking-wide"
                  >Eficiência</span
                >
                <p class="font-bold text-lg text-emerald-400 mt-1">
                  {{
                    Math.round(
                      (timer.elapsedMinutes.value /
                        (task?.plannedDuration || 1)) *
                        100
                    )
                  }}%
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="skipTask" class="btn-premium btn-glass flex-1 py-3">
              Descartar
            </button>
            <button
              @click="completeTask"
              class="btn-premium btn-success flex-1 py-3"
            >
              ✅ Concluir
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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

.timer-ring {
  width: 280px;
  height: 280px;
}

@media (min-width: 640px) {
  .timer-ring {
    width: 320px;
    height: 320px;
  }
}

.timer-ring svg {
  transform: rotate(-90deg);
}

.timer-ring-bg {
  fill: none;
  stroke: var(--bg-tertiary, #334155);
  stroke-width: 8;
}

.timer-ring-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.timer-display {
  font-size: 3.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.05em;
  background: linear-gradient(
    135deg,
    var(--text-primary),
    var(--text-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (min-width: 640px) {
  .timer-display {
    font-size: 4.5rem;
  }
}
</style>
