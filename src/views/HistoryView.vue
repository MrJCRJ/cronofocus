<script setup>
import { ref, computed, onMounted } from "vue";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

const viewMode = ref("list"); // 'list' or 'calendar'
const selectedMonth = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM
const historyData = ref([]);
const loading = ref(true);

onMounted(loadHistory);

async function loadHistory() {
  loading.value = true;
  try {
    const [year, month] = selectedMonth.value.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const tasks = await timeStore.getTasksByDateRange(startDate, endDate);

    // Group by date
    const grouped = {};
    tasks.forEach((task) => {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    });

    // Convert to array sorted by date (most recent first)
    historyData.value = Object.entries(grouped)
      .map(([date, tasks]) => ({
        date,
        tasks: tasks.sort((a, b) =>
          a.plannedStart.localeCompare(b.plannedStart)
        ),
        completed: tasks.filter((t) => t.status === "completed").length,
        total: tasks.length,
        totalMinutes: tasks.reduce(
          (sum, t) => sum + (t.actualDuration || 0),
          0
        ),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
  }
  loading.value = false;
}

function navigateMonth(direction) {
  const [year, month] = selectedMonth.value.split("-").map(Number);
  const newDate = new Date(year, month - 1 + direction, 1);
  selectedMonth.value = newDate.toISOString().slice(0, 7);
  loadHistory();
}

function goToCurrentMonth() {
  selectedMonth.value = new Date().toISOString().slice(0, 7);
  loadHistory();
}

function goToDay(date) {
  timeStore.setDate(date);
}

function getTaskCategory(task) {
  return (
    timeStore.categories.find((c) => c.id === task.category) || {
      color: "#6b7280",
      icon: "📌",
    }
  );
}

const monthLabel = computed(() => {
  const [year, month] = selectedMonth.value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
});

const monthStats = computed(() => {
  const total = historyData.value.reduce((sum, day) => sum + day.total, 0);
  const completed = historyData.value.reduce(
    (sum, day) => sum + day.completed,
    0
  );
  const totalMinutes = historyData.value.reduce(
    (sum, day) => sum + day.totalMinutes,
    0
  );
  const daysWithTasks = historyData.value.length;

  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalMinutes,
    daysWithTasks,
    avgTasksPerDay: daysWithTasks > 0 ? Math.round(total / daysWithTasks) : 0,
  };
});

// Calendar view helpers
const calendarDays = computed(() => {
  const [year, month] = selectedMonth.value.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const days = [];

  // Padding for days before month starts
  const startPadding = firstDay.getDay();
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, isPlaceholder: true });
  }

  // Actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const dayData = historyData.value.find((h) => h.date === date);

    days.push({
      date,
      day: d,
      isToday: date === new Date().toISOString().split("T")[0],
      tasks: dayData?.tasks || [],
      completed: dayData?.completed || 0,
      total: dayData?.total || 0,
    });
  }

  return days;
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
            <span>📜</span>
            Histórico
          </h1>
          <p class="text-gray-400 mt-1 capitalize">
            {{ monthLabel }}
          </p>
        </div>

        <div class="flex items-center gap-4">
          <!-- View Toggle -->
          <div class="flex bg-white/5 rounded-xl p-1">
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-gray-400 hover:text-white',
              ]"
            >
              📋 Lista
            </button>
            <button
              @click="viewMode = 'calendar'"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                viewMode === 'calendar'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-gray-400 hover:text-white',
              ]"
            >
              📅 Calendário
            </button>
          </div>

          <!-- Month Navigation -->
          <div class="flex items-center gap-2">
            <button
              @click="navigateMonth(-1)"
              class="btn-premium btn-glass p-2.5"
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
              @click="goToCurrentMonth"
              class="btn-premium btn-glass px-5 py-2.5 min-w-[140px] capitalize font-medium"
            >
              {{ monthLabel }}
            </button>
            <button
              @click="navigateMonth(1)"
              class="btn-premium btn-glass p-2.5"
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
      </div>

      <!-- Month Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-white">
            {{ monthStats.total }}
          </div>
          <div class="text-xs text-gray-400 mt-1">Tarefas</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-emerald-400">
            {{ monthStats.completed }}
          </div>
          <div class="text-xs text-gray-400 mt-1">Concluídas</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-primary">
            {{ monthStats.completionRate }}%
          </div>
          <div class="text-xs text-gray-400 mt-1">Taxa Conclusão</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-white">
            {{ settingsStore.formatDuration(monthStats.totalMinutes) }}
          </div>
          <div class="text-xs text-gray-400 mt-1">Tempo Total</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-cyan-400">
            {{ monthStats.daysWithTasks }}
          </div>
          <div class="text-xs text-gray-400 mt-1">Dias Ativos</div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
        ></div>
      </div>

      <!-- List View -->
      <div v-else-if="viewMode === 'list'" class="space-y-4">
        <div
          v-if="historyData.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <div class="text-7xl mb-4">📭</div>
          <p class="text-lg">Nenhuma tarefa neste mês</p>
        </div>

        <div
          v-for="day in historyData"
          :key="day.date"
          class="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
        >
          <!-- Day Header -->
          <div
            class="p-5 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all duration-200"
            @click="goToDay(day.date)"
          >
            <div class="flex items-center gap-5">
              <div class="text-center bg-white/5 rounded-xl p-3 min-w-[60px]">
                <div class="text-2xl font-bold text-white">
                  {{ new Date(day.date).getDate() }}
                </div>
                <div class="text-xs text-gray-400 uppercase font-medium">
                  {{
                    new Date(day.date).toLocaleDateString("pt-BR", {
                      weekday: "short",
                    })
                  }}
                </div>
              </div>
              <div>
                <div class="font-semibold text-white text-lg">
                  {{ day.completed }}/{{ day.total }} tarefas
                </div>
                <div class="text-sm text-gray-400">
                  {{ settingsStore.formatDuration(day.totalMinutes) }} de foco
                </div>
              </div>
            </div>

            <!-- Progress -->
            <div class="flex items-center gap-4">
              <div class="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                  :style="{ width: `${(day.completed / day.total) * 100}%` }"
                />
              </div>
              <span
                class="text-sm font-bold text-white min-w-[40px] text-right"
              >
                {{ Math.round((day.completed / day.total) * 100) }}%
              </span>
            </div>
          </div>

          <!-- Tasks -->
          <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="task in day.tasks"
              :key="task.id"
              :class="[
                'p-4 rounded-xl border-l-3 text-sm transition-all duration-200 hover:scale-[1.02]',
                task.status === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : 'bg-white/5 hover:bg-white/10',
              ]"
              :style="{ borderLeftColor: getTaskCategory(task).color }"
            >
              <div class="flex items-start gap-3">
                <span
                  v-if="task.status === 'completed'"
                  class="text-emerald-400"
                  >✅</span
                >
                <span
                  v-else-if="task.status === 'skipped'"
                  class="text-gray-400"
                  >⏭️</span
                >
                <span v-else>{{ getTaskCategory(task).icon }}</span>
                <div class="flex-1 min-w-0">
                  <p
                    :class="[
                      'font-medium truncate',
                      task.status === 'completed'
                        ? 'text-gray-300'
                        : 'text-white',
                    ]"
                  >
                    {{ task.title }}
                  </p>
                  <p class="text-gray-500 mt-1">
                    {{ task.plannedStart }} - {{ task.plannedEnd }}
                    <span
                      v-if="task.actualDuration"
                      class="ml-2 text-emerald-400 font-semibold"
                    >
                      {{ task.actualDuration }}min
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else class="glass-card p-6">
        <!-- Week Headers -->
        <div class="grid grid-cols-7 gap-2 mb-4">
          <div
            v-for="day in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
            :key="day"
            class="text-center text-sm font-semibold text-gray-400"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'aspect-square p-2 rounded-xl transition-all duration-200',
              day.isPlaceholder ? '' : 'bg-white/5 hover:bg-white/10',
              day.isToday
                ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                : '',
              day.total > 0 ? 'cursor-pointer' : '',
            ]"
            @click="day.date && goToDay(day.date)"
          >
            <template v-if="!day.isPlaceholder">
              <div
                :class="[
                  'text-sm font-semibold mb-1',
                  day.isToday ? 'text-primary' : 'text-white',
                ]"
              >
                {{ day.day }}
              </div>

              <div v-if="day.total > 0" class="space-y-1">
                <!-- Mini progress bar -->
                <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    :style="{ width: `${(day.completed / day.total) * 100}%` }"
                  />
                </div>
                <div class="text-[10px] text-gray-400 font-medium">
                  {{ day.completed }}/{{ day.total }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
