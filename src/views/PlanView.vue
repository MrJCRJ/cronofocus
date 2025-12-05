<script setup>
/**
 * PlanView - Planejamento semanal refatorado
 * Componentes: WeekNavigation, DayCard, PlanningTips
 */
import { ref, computed, onMounted } from "vue";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import TaskForm from "@/components/agenda/TaskForm.vue";
import WeekNavigation from "@/components/plan/WeekNavigation.vue";
import DayCard from "@/components/plan/DayCard.vue";
import PlanningTips from "@/components/plan/PlanningTips.vue";

const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

// Estado
const currentWeekStart = ref(getWeekStart(new Date()));
const weekDays = ref([]);
const showTaskForm = ref(false);
const selectedDay = ref(null);
const selectedSlot = ref(null);

// Funções auxiliares
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

// Computed
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
    class="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 pt-16"
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
            <span class="text-indigo-400 font-semibold">{{
              totalWeekTasks
            }}</span>
            tarefas planejadas •
            <span class="text-emerald-400 font-semibold">{{
              completedWeekTasks
            }}</span>
            concluídas
          </p>
        </div>

        <WeekNavigation
          :week-label="weekLabel"
          @navigate="navigateWeek"
          @current="goToCurrentWeek"
        />
      </div>

      <!-- Week Grid -->
      <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <DayCard
          v-for="day in weekDays"
          :key="day.date"
          :day="day"
          :get-task-category="getTaskCategory"
          @add-task="openTaskFormForDay"
        />
      </div>

      <!-- Quick Tips -->
      <div class="mt-8">
        <PlanningTips />
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
