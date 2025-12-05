<script setup>
import { ref, computed, onMounted } from "vue";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

const dayStats = ref(null);
const weekStats = ref(null);
const loading = ref(true);

onMounted(async () => {
  await loadStats();
});

async function loadStats() {
  loading.value = true;
  try {
    dayStats.value = await timeStore.getDayStats();

    // Get week start
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    weekStats.value = await timeStore.getWeekStats(
      weekStart.toISOString().split("T")[0]
    );
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  }
  loading.value = false;
}

const insights = computed(() => {
  if (!dayStats.value) return [];

  const list = [];

  // Completion insight
  if (dayStats.value.completionRate >= 80) {
    list.push({
      type: "success",
      icon: "🎉",
      title: "Excelente produtividade!",
      message: `Você completou ${dayStats.value.completionRate}% das suas tarefas hoje.`,
    });
  } else if (
    dayStats.value.completionRate < 50 &&
    dayStats.value.totalTasks > 0
  ) {
    list.push({
      type: "warning",
      icon: "💪",
      title: "Ainda dá tempo!",
      message: `Você tem ${dayStats.value.planned} tarefas pendentes. Foco!`,
    });
  }

  // Efficiency insight
  if (dayStats.value.efficiencyRate > 100) {
    list.push({
      type: "info",
      icon: "⏱️",
      title: "Tarefas levando mais tempo",
      message: "Considere estimar mais tempo para tarefas similares.",
    });
  } else if (
    dayStats.value.efficiencyRate > 0 &&
    dayStats.value.efficiencyRate < 80
  ) {
    list.push({
      type: "success",
      icon: "🚀",
      title: "Mais rápido que o esperado!",
      message: "Você está terminando as tarefas antes do planejado.",
    });
  }

  // Distraction insight
  if (dayStats.value.totalDistractions > 5) {
    list.push({
      type: "warning",
      icon: "🔔",
      title: "Muitas distrações",
      message: "Considere desativar notificações durante o foco.",
    });
  } else if (
    dayStats.value.totalDistractions === 0 &&
    dayStats.value.completed > 0
  ) {
    list.push({
      type: "success",
      icon: "🧘",
      title: "Foco total!",
      message: "Nenhuma distração registrada. Excelente concentração!",
    });
  }

  return list;
});

const categoryBreakdown = computed(() => {
  if (!dayStats.value?.byCategory) return [];

  return Object.entries(dayStats.value.byCategory)
    .map(([id, data]) => {
      const category = timeStore.categories.find((c) => c.id === id) || {
        name: id,
        color: "#6b7280",
        icon: "📌",
      };
      return {
        ...category,
        ...data,
        percentage:
          dayStats.value.totalActualMinutes > 0
            ? Math.round(
                (data.actualMinutes / dayStats.value.totalActualMinutes) * 100
              )
            : 0,
      };
    })
    .sort((a, b) => b.actualMinutes - a.actualMinutes);
});

const dailyCompletionData = computed(() => {
  if (!weekStats.value?.dailyCompletion) return [];
  return weekStats.value.dailyCompletion;
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
            <span>📊</span>
            Análise do Dia
          </h1>
          <p class="text-gray-400 mt-1">
            {{ settingsStore.formatDate(timeStore.selectedDate) }}
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
        ></div>
      </div>

      <template v-else>
        <!-- Stats Overview -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="glass-card p-5">
            <div class="text-gray-400 text-sm mb-2">Tarefas</div>
            <div class="text-3xl font-bold text-white">
              {{ dayStats?.completed || 0 }}/{{ dayStats?.totalTasks || 0 }}
            </div>
            <div class="text-sm text-emerald-400 mt-1">
              {{ dayStats?.completionRate || 0 }}% concluídas
            </div>
          </div>

          <div class="glass-card p-5">
            <div class="text-gray-400 text-sm mb-2">Tempo Real</div>
            <div class="text-3xl font-bold text-white">
              {{
                settingsStore.formatDuration(dayStats?.totalActualMinutes || 0)
              }}
            </div>
            <div class="text-sm text-primary mt-1">
              de
              {{
                settingsStore.formatDuration(dayStats?.totalPlannedMinutes || 0)
              }}
              planejadas
            </div>
          </div>

          <div class="glass-card p-5">
            <div class="text-gray-400 text-sm mb-2">Eficiência</div>
            <div class="text-3xl font-bold text-white">
              {{ dayStats?.efficiencyRate || 0 }}%
            </div>
            <div
              class="text-sm mt-1"
              :class="
                dayStats?.efficiencyRate > 100
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              "
            >
              {{
                dayStats?.efficiencyRate > 100
                  ? "Acima do planejado"
                  : "Dentro do esperado"
              }}
            </div>
          </div>

          <div class="glass-card p-5">
            <div class="text-gray-400 text-sm mb-2">Distrações</div>
            <div
              class="text-3xl font-bold"
              :class="
                dayStats?.totalDistractions > 3
                  ? 'text-amber-400'
                  : 'text-white'
              "
            >
              {{ dayStats?.totalDistractions || 0 }}
            </div>
            <div class="text-sm text-gray-500 mt-1">interrupções</div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Planned vs Actual Chart -->
          <div class="lg:col-span-2 glass-card p-6">
            <h3 class="font-semibold mb-6 flex items-center gap-2 text-white">
              <span>📈</span>
              Planejado vs Realizado (Semana)
            </h3>

            <div class="space-y-5">
              <div
                v-for="day in dailyCompletionData"
                :key="day.date"
                class="flex items-center gap-4 p-3 bg-white/5 rounded-xl transition-all duration-200 hover:bg-white/10"
              >
                <div class="w-16 text-sm text-gray-400 font-medium">
                  {{
                    new Date(day.date).toLocaleDateString("pt-BR", {
                      weekday: "short",
                    })
                  }}
                </div>

                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1.5">
                    <div
                      class="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden"
                    >
                      <div
                        class="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
                        :style="{ width: `${day.rate}%` }"
                      />
                    </div>
                    <span class="text-sm font-bold w-12 text-right text-white">
                      {{ day.rate }}%
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ day.completed }}/{{ day.total }} tarefas •
                    {{ settingsStore.formatDuration(day.minutes) }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="dailyCompletionData.length === 0"
              class="text-center py-8 text-gray-500"
            >
              Sem dados para exibir
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="glass-card p-6">
            <h3 class="font-semibold mb-6 flex items-center gap-2 text-white">
              <span>🏷️</span>
              Por Categoria
            </h3>

            <div v-if="categoryBreakdown.length > 0" class="space-y-5">
              <div
                v-for="cat in categoryBreakdown"
                :key="cat.id"
                class="space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2 text-gray-300">
                    <span class="text-lg">{{ cat.icon }}</span>
                    <span>{{ cat.name }}</span>
                  </span>
                  <span class="font-bold text-white"
                    >{{ cat.percentage }}%</span
                  >
                </div>
                <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-500"
                    :style="{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                      boxShadow: `0 0 10px ${cat.color}60`,
                    }"
                  />
                </div>
                <div class="text-xs text-gray-500">
                  {{ cat.completed }}/{{ cat.count }} tarefas •
                  {{ settingsStore.formatDuration(cat.actualMinutes) }}
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              Nenhuma categoria ainda
            </div>
          </div>
        </div>

        <!-- Insights -->
        <div v-if="insights.length > 0" class="mt-8">
          <h3 class="font-semibold mb-4 flex items-center gap-2 text-white">
            <span>💡</span>
            Insights
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(insight, index) in insights"
              :key="index"
              :class="[
                'glass-card p-5 transition-all duration-300 hover:scale-[1.02]',
                insight.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : '',
                insight.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : '',
                insight.type === 'info'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : '',
              ]"
            >
              <div class="flex items-start gap-4">
                <span class="text-3xl">{{ insight.icon }}</span>
                <div>
                  <h4 class="font-semibold text-white">{{ insight.title }}</h4>
                  <p class="text-sm text-gray-400 mt-1">
                    {{ insight.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
