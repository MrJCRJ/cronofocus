<script setup>
import { ref, computed, onMounted } from "vue";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import TaskForm from "@/components/agenda/TaskForm.vue";

const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

const currentWeekStart = ref(getWeekStart(new Date()));
const weekDays = ref([]);
const showTaskForm = ref(false);
const selectedDay = ref(null);
const selectedSlot = ref(null);

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

onMounted(() => {
  loadWeekData();
});

async function loadWeekData() {
  const startDate = new Date(currentWeekStart.value);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const tasks = await timeStore.getTasksByDateRange(dateStr, dateStr);

    days.push({
      date: dateStr,
      dayName: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      dayNumber: date.getDate(),
      isToday: dateStr === new Date().toISOString().split("T")[0],
      tasks,
    });
  }

  weekDays.value = days;
}

function navigateWeek(direction) {
  const current = new Date(currentWeekStart.value);
  current.setDate(current.getDate() + direction * 7);
  currentWeekStart.value = current.toISOString().split("T")[0];
  loadWeekData();
}

function goToCurrentWeek() {
  currentWeekStart.value = getWeekStart(new Date());
  loadWeekData();
}

function openTaskFormForDay(day) {
  selectedDay.value = day.date;
  timeStore.setDate(day.date);
  showTaskForm.value = true;
}

async function handleTaskSaved() {
  showTaskForm.value = false;
  selectedDay.value = null;
  await loadWeekData();
}

function getTaskCategory(task) {
  return (
    timeStore.categories.find((c) => c.id === task.category) || {
      color: "#6b7280",
      icon: "📌",
    }
  );
}

const weekLabel = computed(() => {
  const start = new Date(currentWeekStart.value);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return `${start.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })} - ${end.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
});

const totalWeekTasks = computed(() => {
  return weekDays.value.reduce((sum, day) => sum + day.tasks.length, 0);
});

const completedWeekTasks = computed(() => {
  return weekDays.value.reduce((sum, day) => {
    return sum + day.tasks.filter((t) => t.status === "completed").length;
  }, 0);
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 pt-16"
  >
    <div class="max-w-7xl mx-auto p-4 lg:p-6">
      <!-- Header -->
      <div
        class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
      >
        <div class="animate-fade-in">
          <h1
            class="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-white"
          >
            <span>📅</span>
            Planejar Semana
          </h1>
          <p class="text-gray-400 mt-1">
            <span class="text-primary font-semibold">{{ totalWeekTasks }}</span>
            tarefas planejadas •
            <span class="text-emerald-400 font-semibold">{{
              completedWeekTasks
            }}</span>
            concluídas
          </p>
        </div>

        <!-- Week Navigation -->
        <div class="flex items-center gap-2">
          <button @click="navigateWeek(-1)" class="btn-premium btn-glass p-2.5">
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
            @click="goToCurrentWeek"
            class="btn-premium btn-glass px-6 py-2.5 min-w-[180px] font-medium"
          >
            {{ weekLabel }}
          </button>

          <button @click="navigateWeek(1)" class="btn-premium btn-glass p-2.5">
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

      <!-- Week Grid -->
      <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div
          v-for="day in weekDays"
          :key="day.date"
          :class="[
            'glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02]',
            day.isToday
              ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
              : 'hover:shadow-lg hover:shadow-primary/10',
          ]"
        >
          <!-- Day Header -->
          <div
            :class="[
              'p-3 text-center border-b border-white/10',
              day.isToday ? 'bg-primary/20' : 'bg-white/5',
            ]"
          >
            <div
              class="text-xs uppercase tracking-wider text-gray-400 font-medium"
            >
              {{ day.dayName }}
            </div>
            <div
              :class="[
                'text-2xl font-bold',
                day.isToday ? 'text-primary' : 'text-white',
              ]"
            >
              {{ day.dayNumber }}
            </div>
          </div>

          <!-- Tasks List -->
          <div
            class="p-3 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar"
          >
            <div v-if="day.tasks.length > 0" class="space-y-2">
              <div
                v-for="task in day.tasks"
                :key="task.id"
                :class="[
                  'p-3 rounded-xl text-xs border-l-3 transition-all duration-200 cursor-pointer hover:scale-[1.02]',
                  task.status === 'completed'
                    ? 'bg-emerald-500/10 border-emerald-500'
                    : 'bg-white/5 hover:bg-white/10',
                ]"
                :style="{ borderLeftColor: getTaskCategory(task).color }"
              >
                <div class="flex items-start gap-2">
                  <span
                    v-if="task.status === 'completed'"
                    class="text-emerald-400"
                    >✅</span
                  >
                  <span v-else>{{ getTaskCategory(task).icon }}</span>
                  <div class="flex-1 min-w-0">
                    <p
                      :class="[
                        'font-medium truncate',
                        task.status === 'completed'
                          ? 'text-gray-400 line-through'
                          : 'text-white',
                      ]"
                    >
                      {{ task.title }}
                    </p>
                    <p class="text-gray-500 mt-0.5">
                      {{ task.plannedStart }} - {{ task.plannedEnd }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="h-full flex items-center justify-center text-gray-500"
            >
              <p class="text-sm">Nenhuma tarefa</p>
            </div>
          </div>

          <!-- Add Task Button -->
          <div class="p-3 border-t border-white/10">
            <button
              @click="openTaskFormForDay(day)"
              class="btn-premium btn-glass w-full py-2 text-sm"
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
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <div class="mt-8 glass-card p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2 text-white">
          <span>💡</span>
          Dicas de Planejamento
        </h3>
        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300"
        >
          <div class="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
            <span class="text-2xl">🎯</span>
            <p>
              <strong class="text-white">Priorize:</strong> Comece com as 3
              tarefas mais importantes do dia
            </p>
          </div>
          <div class="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
            <span class="text-2xl">⏰</span>
            <p>
              <strong class="text-white">Estime com margem:</strong> Adicione
              20% extra ao tempo estimado
            </p>
          </div>
          <div class="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
            <span class="text-2xl">🧘</span>
            <p>
              <strong class="text-white">Intervalos:</strong> Planeje pausas de
              5-10 min entre tarefas longas
            </p>
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
          @click="showTaskForm = false"
        />
        <div class="relative w-full max-w-lg animate-slide-up">
          <TaskForm
            :initial-slot="selectedSlot"
            @saved="handleTaskSaved"
            @cancel="showTaskForm = false"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
