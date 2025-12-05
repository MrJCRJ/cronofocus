<script setup>
/**
 * ExportPreview - Preview e dicas de exportação
 */
defineProps({
  previewData: { type: Object, required: true },
  exportFormat: { type: String, required: true },
  formatDate: { type: Function, required: true },
});
</script>

<template>
  <div>
    <!-- Preview -->
    <div class="bg-white/5 rounded-xl p-5">
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
            {{ formatDate(previewData.dates.start) }}
            <span class="text-gray-500 mx-2">até</span>
            {{ formatDate(previewData.dates.end) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Format Tips -->
    <div class="text-sm text-gray-400 space-y-2 mt-6">
      <div
        v-if="exportFormat === 'csv'"
        class="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20"
      >
        <span class="text-lg">💡</span>
        <p>
          O arquivo CSV pode ser aberto diretamente no Excel, Google Sheets ou
          Numbers.
        </p>
      </div>
      <div
        v-if="exportFormat === 'json'"
        class="flex items-start gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20"
      >
        <span class="text-lg">💡</span>
        <p>
          O JSON inclui backup completo de tarefas, categorias e configurações.
          Ideal para restauração.
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
  </div>
</template>
