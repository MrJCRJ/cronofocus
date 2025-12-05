<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

const stats = ref(null);
const loading = ref(true);

onMounted(loadStats);

watch(() => timeStore.selectedDate, loadStats);
watch(() => timeStore.tasks, loadStats, { deep: true });

async function loadStats() {
  try {
    loading.value = true;
    stats.value = await timeStore.getDayStats();
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  } finally {
    loading.value = false;
  }
}

const completionRate = computed(() => stats.value?.completionRate || 0);
const efficiencyRate = computed(() => stats.value?.efficiencyRate || 0);

const totalHours = computed(() => {
  if (!stats.value) return "0h";
  const hours = Math.floor(stats.value.totalActualMinutes / 60);
  const mins = stats.value.totalActualMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
});

const focusScore = computed(() => {
  if (!stats.value) return 0;

  // Calculate focus score based on multiple factors
  const completionWeight = 0.4;
  const efficiencyWeight = 0.3;
  const distractionWeight = 0.3;

  const completionScore = stats.value.completionRate;
  const efficiencyScore = Math.min(100, stats.value.efficiencyRate);

  // Distraction penalty: more distractions = lower score
  const avgDistractions =
    stats.value.totalTasks > 0
      ? stats.value.totalDistractions / stats.value.totalTasks
      : 0;
  const distractionScore = Math.max(0, 100 - avgDistractions * 20);

  return Math.round(
    completionScore * completionWeight +
      efficiencyScore * efficiencyWeight +
      distractionScore * distractionWeight
  );
});

const focusGrade = computed(() => {
  const score = focusScore.value;
  if (score >= 90) return { grade: "A", color: "text-green-400", emoji: "🌟" };
  if (score >= 80) return { grade: "B", color: "text-blue-400", emoji: "💪" };
  if (score >= 70) return { grade: "C", color: "text-yellow-400", emoji: "👍" };
  if (score >= 60) return { grade: "D", color: "text-orange-400", emoji: "📈" };
  return { grade: "F", color: "text-red-400", emoji: "💡" };
});

const topCategories = computed(() => {
  if (!stats.value?.byCategory) return [];

  return Object.entries(stats.value.byCategory)
    .map(([id, data]) => {
      const category = timeStore.categories.find((c) => c.id === id) || {
        name: id,
        color: "#6b7280",
        icon: "📌",
      };
      return { ...category, ...data };
    })
    .sort((a, b) => b.actualMinutes - a.actualMinutes)
    .slice(0, 3);
});
</script>

<template>
  <div class="bg-base-200 rounded-2xl border border-base-300 p-4">
    <h3 class="font-semibold mb-4 flex items-center gap-2">
      <span>📊</span>
      Estatísticas do Dia
    </h3>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-md"></span>
    </div>

    <!-- Stats Content -->
    <div v-else-if="stats" class="space-y-4">
      <!-- Focus Score -->
      <div class="text-center p-4 bg-base-300 rounded-xl">
        <div class="text-4xl mb-2">{{ focusGrade.emoji }}</div>
        <div :class="['text-3xl font-bold', focusGrade.color]">
          {{ focusScore }}
        </div>
        <div class="text-sm text-base-content/60">Nota de Foco</div>
      </div>

      <!-- Completion Rate -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>Conclusão</span>
          <span class="font-medium">{{ completionRate }}%</span>
        </div>
        <div class="h-2 bg-base-300 rounded-full overflow-hidden">
          <div
            class="h-full bg-linear-to-r from-green-500 to-emerald-400 transition-all duration-500"
            :style="{ width: `${completionRate}%` }"
          />
        </div>
      </div>

      <!-- Efficiency Rate -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>Eficiência</span>
          <span class="font-medium">{{ efficiencyRate }}%</span>
        </div>
        <div class="h-2 bg-base-300 rounded-full overflow-hidden">
          <div
            class="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-500"
            :style="{ width: `${Math.min(100, efficiencyRate)}%` }"
          />
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-2 gap-3 pt-2">
        <div class="bg-base-300 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold">{{ stats.completed }}</div>
          <div class="text-xs text-base-content/60">Concluídas</div>
        </div>
        <div class="bg-base-300 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold">{{ stats.totalTasks }}</div>
          <div class="text-xs text-base-content/60">Total</div>
        </div>
        <div class="bg-base-300 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold">{{ totalHours }}</div>
          <div class="text-xs text-base-content/60">Tempo Real</div>
        </div>
        <div class="bg-base-300 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-amber-400">
            {{ stats.totalDistractions }}
          </div>
          <div class="text-xs text-base-content/60">Distrações</div>
        </div>
      </div>

      <!-- Top Categories -->
      <div v-if="topCategories.length > 0" class="pt-2">
        <h4 class="text-sm font-medium mb-2">Principais Categorias</h4>
        <div class="space-y-2">
          <div
            v-for="cat in topCategories"
            :key="cat.id"
            class="flex items-center gap-2 text-sm"
          >
            <div
              class="w-2 h-2 rounded-full"
              :style="{ backgroundColor: cat.color }"
            />
            <span class="flex-1">{{ cat.icon }} {{ cat.name }}</span>
            <span class="text-base-content/60">
              {{ settingsStore.formatDuration(cat.actualMinutes) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-base-content/60">
      <p>Nenhum dado ainda</p>
    </div>
  </div>
</template>
