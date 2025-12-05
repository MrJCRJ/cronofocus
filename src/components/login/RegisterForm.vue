<script setup>
/**
 * RegisterForm - Formulário de registro de novo perfil
 */
import { ref, computed } from "vue";

defineProps({
  avatarColors: { type: Array, required: true },
  hasProfiles: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
});

const emit = defineEmits(["register", "goBack"]);

const form = ref({
  username: "",
  displayName: "",
  password: "",
  confirmPassword: "",
  avatarColor: "#3b82f6",
  usePassword: false,
});

const avatarPreview = computed(() => {
  return (form.value.displayName || form.value.username || "?")
    .substring(0, 2)
    .toUpperCase();
});

function submit() {
  emit("register", { ...form.value });
}
</script>

<template>
  <div class="p-6">
    <button
      v-if="hasProfiles"
      @click="$emit('goBack')"
      class="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors duration-200"
    >
      <span>←</span>
      <span>Voltar</span>
    </button>

    <h2 class="text-xl font-bold mb-6 text-white">Criar Perfil Local</h2>

    <form @submit.prevent="submit" class="space-y-5">
      <!-- Avatar Color -->
      <div>
        <label class="block text-sm font-medium mb-3 text-gray-300"
          >Cor do Avatar</label
        >
        <div class="flex flex-wrap gap-3">
          <button
            v-for="color in avatarColors"
            :key="color"
            type="button"
            @click="form.avatarColor = color"
            :class="[
              'w-11 h-11 rounded-full transition-all duration-300',
              form.avatarColor === color
                ? 'ring-3 ring-white ring-offset-3 ring-offset-gray-900 scale-110'
                : 'hover:scale-110',
            ]"
            :style="{
              backgroundColor: color,
              boxShadow:
                form.avatarColor === color ? `0 0 20px ${color}60` : '',
            }"
          />
        </div>
      </div>

      <!-- Preview -->
      <div class="flex justify-center py-4">
        <div
          class="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-2xl transition-all duration-300"
          :style="{
            backgroundColor: form.avatarColor,
            boxShadow: `0 20px 60px ${form.avatarColor}50`,
          }"
        >
          {{ avatarPreview }}
        </div>
      </div>

      <!-- Username -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">
          Nome de Usuário <span class="text-red-400">*</span>
        </label>
        <input
          v-model="form.username"
          type="text"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          placeholder="jose"
          pattern="[a-zA-Z0-9_]+"
        />
        <p class="text-xs text-gray-500 mt-2">
          Apenas letras, números e underscore
        </p>
      </div>

      <!-- Display Name -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300"
          >Nome de Exibição</label
        >
        <input
          v-model="form.displayName"
          type="text"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          placeholder="José Silva"
        />
      </div>

      <!-- Password Toggle -->
      <div class="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            v-model="form.usePassword"
            class="sr-only peer"
          />
          <div
            class="w-12 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
          ></div>
        </label>
        <span class="text-gray-300">Proteger com senha</span>
      </div>

      <!-- Password Fields -->
      <div v-if="form.usePassword" class="space-y-4 animate-slide-up">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300"
            >Senha</label
          >
          <input
            v-model="form.password"
            type="password"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300"
            >Confirmar Senha</label
          >
          <input
            v-model="form.confirmPassword"
            type="password"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            placeholder="••••••••"
          />
        </div>
      </div>

      <p
        v-if="errorMessage"
        class="text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20"
      >
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        class="btn-premium btn-primary w-full py-3.5 text-lg"
        :disabled="loading"
      >
        <span v-if="loading" class="animate-spin mr-2">⏳</span>
        <span v-else>Criar Perfil</span>
      </button>
    </form>
  </div>
</template>
