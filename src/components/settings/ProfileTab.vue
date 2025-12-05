<script setup>
/**
 * ProfileTab - Aba de configurações do perfil
 */
import { computed } from "vue";

const props = defineProps({
  profileForm: { type: Object, required: true },
  authStore: { type: Object, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:profileForm",
  "updateProfile",
  "updatePassword",
]);

const localForm = computed({
  get: () => props.profileForm,
  set: (value) => emit("update:profileForm", value),
});
</script>

<template>
  <div class="space-y-6">
    <!-- Profile Info -->
    <div class="glass-card p-6">
      <h3 class="font-semibold mb-6 text-white">Informações do Perfil</h3>

      <!-- Avatar Preview -->
      <div class="flex items-center gap-6 mb-6">
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl"
          :style="{
            backgroundColor: localForm.avatarColor,
            boxShadow: `0 10px 40px ${localForm.avatarColor}40`,
          }"
        >
          {{ (localForm.displayName || "?").substring(0, 2).toUpperCase() }}
        </div>
        <div>
          <p class="font-semibold text-lg text-white">
            {{ localForm.displayName }}
          </p>
          <p class="text-gray-400">@{{ authStore.user?.username }}</p>
        </div>
      </div>

      <form @submit.prevent="$emit('updateProfile')" class="space-y-5">
        <!-- Display Name -->
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300"
            >Nome de Exibição</label
          >
          <input
            v-model="localForm.displayName"
            type="text"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </div>

        <!-- Avatar Color -->
        <div>
          <label class="block text-sm font-medium mb-3 text-gray-300"
            >Cor do Avatar</label
          >
          <div class="flex flex-wrap gap-3">
            <button
              v-for="color in authStore.AVATAR_COLORS"
              :key="color"
              type="button"
              @click="localForm.avatarColor = color"
              :class="[
                'w-11 h-11 rounded-full transition-all duration-300',
                localForm.avatarColor === color
                  ? 'ring-3 ring-white ring-offset-3 ring-offset-gray-900 scale-110 shadow-lg'
                  : 'hover:scale-110',
              ]"
              :style="{
                backgroundColor: color,
                boxShadow:
                  localForm.avatarColor === color ? `0 0 20px ${color}60` : '',
              }"
            />
          </div>
        </div>

        <button
          type="submit"
          class="btn-premium btn-primary px-6 py-3"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin mr-2">⏳</span>
          Salvar Alterações
        </button>
      </form>
    </div>

    <!-- Password Section -->
    <div v-if="!authStore.isGuest" class="glass-card p-6">
      <h3 class="font-semibold mb-6 text-white">
        {{ authStore.user?.hasPassword ? "Alterar Senha" : "Definir Senha" }}
      </h3>
      <slot name="password-form" />
    </div>
  </div>
</template>
