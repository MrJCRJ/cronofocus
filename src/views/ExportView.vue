<script setup>
import { ref, computed } from "vue";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { useExport } from "@/composables/useExport";

const timeStore = useTimeStore();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const { exportToCSV, exportToJSON, exportToPNG, isExporting, lastExport } =
  useExport();

const exportFormat = ref("csv");
const dateRangeType = ref("week");
const customStartDate = ref("");
const customEndDate = ref("");
const exportSuccess = ref(false);
const exportError = ref("");

const formats = [
  {
    id: "csv",
    name: "CSV",
    icon: "📊",
    description: "Para Excel/Google Sheets",
  },
  { id: "json", name: "JSON", icon: "📦", description: "Backup completo" },
  { id: "png", name: "PNG", icon: "🖼️", description: "Imagem da agenda" },
];

const dateRanges = [
  { id: "today", name: "Hoje" },
  { id: "week", name: "Esta Semana" },
  { id: "month", name: "Este Mês" },
  { id: "all", name: "Todos os Dados" },
  { id: "custom", name: "Período Personalizado" },
];

const dateRange = computed(() => {
  const today = new Date();
  let start, end;

  switch (dateRangeType.value) {
    case "today":
      start = end = today.toISOString().split("T")[0];
      break;
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      start = weekStart.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
      break;
    case "month":
      start = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      end = today.toISOString().split("T")[0];
      break;
    case "all":
      start = "2020-01-01";
      end = today.toISOString().split("T")[0];
      break;
    case "custom":
      start = customStartDate.value || today.toISOString().split("T")[0];
      end = customEndDate.value || today.toISOString().split("T")[0];
      break;
  }

  return { start, end };
});

async function handleExport() {
  try {
    exportSuccess.value = false;
    exportError.value = "";

    const { start, end } = dateRange.value;
    const tasks = await timeStore.getTasksByDateRange(start, end);

    const options = {
      userId: authStore.user?.id,
      dateRange: { start, end },
    };

    let result;

    switch (exportFormat.value) {
      case "csv":
        result = await exportToCSV(tasks, options);
        break;
      case "json":
        result = await exportToJSON(null, options); // Exports all user data
        break;
      case "png":
        // For PNG, we need to be on the home page with timeline visible
        // Or we can export a summary
        result = await exportToPNG("agenda-timeline", options);
        break;
    }

    if (result.success) {
      exportSuccess.value = true;
      setTimeout(() => {
        exportSuccess.value = false;
      }, 3000);
    } else {
      exportError.value = result.error;
    }
  } catch (error) {
    exportError.value = error.message;
  }
}

const previewData = computed(() => {
  // This would show a preview of what will be exported
  return {
    format: formats.find((f) => f.id === exportFormat.value),
    dateRange: dateRanges.find((d) => d.id === dateRangeType.value),
    dates: dateRange.value,
  };
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 pt-16"
  >
    <div class="max-w-4xl mx-auto p-4 lg:p-6">
      <!-- Header -->
      <div class="mb-8 animate-fade-in">
        <h1
          class="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-white"
        >
          <span>📤</span>
          Exportar Dados
        </h1>
        <p class="text-gray-400 mt-1">
          Exporte suas tarefas e estatísticas em diferentes formatos
        </p>
      </div>

      <!-- Export Form -->
      <div class="glass-card p-6 space-y-8">
        <!-- Format Selection -->
        <div>
          <h3 class="font-semibold mb-4 text-white">Formato de Exportação</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              v-for="format in formats"
              :key="format.id"
              @click="exportFormat = format.id"
              :class="[
                'p-5 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02]',
                exportFormat === format.id
                  ? 'border-primary bg-primary/15 shadow-lg shadow-primary/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20',
              ]"
            >
              <div class="text-4xl mb-3">{{ format.icon }}</div>
              <div class="font-semibold text-white">{{ format.name }}</div>
              <div class="text-sm text-gray-400 mt-1">
                {{ format.description }}
              </div>
            </button>
          </div>
        </div>

        <!-- Date Range -->
        <div>
          <h3 class="font-semibold mb-4 text-white">Período</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="range in dateRanges"
              :key="range.id"
              @click="dateRangeType = range.id"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                dateRangeType === range.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10',
              ]"
            >
              {{ range.name }}
            </button>
          </div>

          <!-- Custom Date Inputs -->
          <div
            v-if="dateRangeType === 'custom'"
            class="mt-4 grid grid-cols-2 gap-4"
          >
            <div>
              <label class="block text-sm mb-2 text-gray-300"
                >Data Inicial</label
              >
              <input
                v-model="customStartDate"
                type="date"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div>
              <label class="block text-sm mb-2 text-gray-300">Data Final</label>
              <input
                v-model="customEndDate"
                type="date"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="bg-white/5 rounded-xl p-5 border border-white/10">
          <h4 class="font-medium mb-4 text-white flex items-center gap-2">
            <span>📋</span>
            Resumo da Exportação
          </h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Formato:</span>
              <p class="font-semibold text-white mt-1">
                {{ previewData.format?.name }} ({{ previewData.format?.icon }})
              </p>
            </div>
            <div>
              <span class="text-gray-500">Período:</span>
              <p class="font-semibold text-white mt-1">
                {{ previewData.dateRange?.name }}
              </p>
            </div>
            <div class="col-span-2">
              <span class="text-gray-500">Datas:</span>
              <p class="font-semibold text-white mt-1">
                {{ settingsStore.formatDate(previewData.dates.start) }}
                <span class="text-gray-500 mx-2">até</span>
                {{ settingsStore.formatDate(previewData.dates.end) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Format-specific info -->
        <div class="text-sm text-gray-400 space-y-2">
          <div
            v-if="exportFormat === 'csv'"
            class="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20"
          >
            <span class="text-lg">💡</span>
            <p>
              O arquivo CSV pode ser aberto diretamente no Excel, Google Sheets
              ou Numbers.
            </p>
          </div>
          <div
            v-if="exportFormat === 'json'"
            class="flex items-start gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20"
          >
            <span class="text-lg">💡</span>
            <p>
              O JSON inclui backup completo de tarefas, categorias e
              configurações. Ideal para restauração.
            </p>
          </div>
          <div
            v-if="exportFormat === 'png'"
            class="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
          >
            <span class="text-lg">💡</span>
            <p>
              A imagem PNG captura a timeline atual. Vá para a Agenda do dia
              desejado antes de exportar.
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="exportError"
          class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3"
        >
          <span class="text-xl">❌</span>
          <span>{{ exportError }}</span>
        </div>

        <!-- Success Message -->
        <div
          v-if="exportSuccess"
          class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3"
        >
          <span class="text-xl">✅</span>
          <span>Exportação realizada com sucesso!</span>
        </div>

        <!-- Export Button -->
        <button
          @click="handleExport"
          :disabled="isExporting"
          class="btn-premium btn-primary w-full py-4 text-lg font-semibold"
        >
          <span v-if="isExporting" class="animate-spin mr-2">⏳</span>
          <span v-else class="mr-2">📥</span>
          Exportar {{ formats.find((f) => f.id === exportFormat)?.name }}
        </button>
      </div>

      <!-- Last Export Info -->
      <div v-if="lastExport" class="mt-6 glass-card p-5">
        <h4 class="font-medium mb-3 text-white flex items-center gap-2">
          <span>📄</span>
          Última Exportação
        </h4>
        <div class="text-sm text-gray-400 space-y-1">
          <p>
            Arquivo:
            <span class="text-gray-300">{{ lastExport.filename }}</span>
          </p>
          <p>
            Formato:
            <span class="text-gray-300">{{
              lastExport.format?.toUpperCase()
            }}</span>
          </p>
          <p>
            Data:
            <span class="text-gray-300">{{
              new Date(lastExport.timestamp).toLocaleString("pt-BR")
            }}</span>
          </p>
        </div>
      </div>

      <!-- Import Section -->
      <div class="mt-8 glass-card p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2 text-white">
          <span>📥</span>
          Importar Dados
        </h3>
        <p class="text-gray-400 mb-4">
          Restaure seus dados a partir de um backup JSON exportado
          anteriormente.
        </p>
        <div class="relative">
          <input
            type="file"
            accept=".json"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-medium file:cursor-pointer cursor-pointer focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </div>
        <p class="text-xs text-gray-500 mt-3">
          Apenas arquivos JSON exportados pelo CronoFocus são aceitos.
        </p>
      </div>
    </div>
  </div>
</template>
