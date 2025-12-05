<script setup>
/**
 * DataTab - Aba de gerenciamento de dados
 */
const props = defineProps({
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["goToExport", "logout", "deleteAccount"]);
</script>

<template>
  <div class="space-y-6">
    <!-- Data Management -->
    <div class="glass-card p-6">
      <h3 class="font-semibold mb-6 text-white">Gerenciamento de Dados</h3>

      <div class="space-y-4">
        <button
          @click="$emit('goToExport')"
          class="btn-premium btn-glass w-full justify-start px-5 py-4 text-left"
        >
          <span class="mr-3 text-xl">📤</span>
          <span>Exportar Meus Dados</span>
        </button>

        <button
          class="btn-premium btn-glass w-full justify-start px-5 py-4 text-left"
        >
          <span class="mr-3 text-xl">📥</span>
          <span>Importar Backup</span>
        </button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="glass-card p-6 border-red-500/30">
      <h3 class="font-semibold mb-4 text-red-400">🚨 Zona de Perigo</h3>

      <div class="space-y-4">
        <button
          @click="$emit('logout')"
          class="btn-premium btn-glass w-full justify-start px-5 py-4 text-left text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
        >
          <span class="mr-3 text-xl">🚪</span>
          <span>Sair da Conta</span>
        </button>

        <button
          @click="$emit('deleteAccount')"
          class="btn-premium btn-danger w-full justify-start px-5 py-4 text-left"
          :disabled="loading"
        >
          <span class="mr-3 text-xl">🗑️</span>
          <span>Excluir Minha Conta</span>
        </button>

        <p class="text-xs text-gray-500">
          A exclusão da conta é permanente e todos os dados serão perdidos.
        </p>
      </div>
    </div>
  </div>
</template>
