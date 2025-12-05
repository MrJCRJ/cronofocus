<script setup>
/**
 * ProfileSelector - Lista de perfis para seleção
 */
defineProps({
  profiles: { type: Array, required: true },
});

const emit = defineEmits(["selectProfile", "createNew", "useAsGuest"]);
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-6 text-center text-white">
      {{ profiles.length > 0 ? "Escolha seu perfil" : "Bem-vindo!" }}
    </h2>

    <!-- Profile List -->
    <div v-if="profiles.length > 0" class="space-y-3 mb-6">
      <button
        v-for="profile in profiles"
        :key="profile.id"
        @click="$emit('selectProfile', profile)"
        class="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center gap-4 group border border-white/10 hover:border-primary/30"
      >
        <div
          class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110"
          :style="{
            backgroundColor: profile.avatarColor,
            boxShadow: `0 8px 30px ${profile.avatarColor}40`,
          }"
        >
          {{ profile.displayName?.substring(0, 2).toUpperCase() || "?" }}
        </div>
        <div class="flex-1 text-left">
          <p class="font-semibold text-white">{{ profile.displayName }}</p>
          <p class="text-sm text-gray-400">@{{ profile.username }}</p>
        </div>
        <div v-if="profile.hasPassword" class="text-gray-500">🔒</div>
      </button>
    </div>

    <!-- Actions -->
    <div class="space-y-3">
      <button
        @click="$emit('createNew')"
        class="btn-premium btn-primary w-full py-3.5 text-lg"
      >
        <span class="mr-2">✨</span>
        Criar Novo Perfil
      </button>
      <button
        @click="$emit('useAsGuest')"
        class="btn-premium btn-glass w-full py-3"
      >
        Continuar como Convidado
      </button>
    </div>
  </div>
</template>
