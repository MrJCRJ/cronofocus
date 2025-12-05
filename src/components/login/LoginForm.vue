<script setup>
/**
 * LoginForm - Formulário de login com senha
 */
import { ref } from "vue";

defineProps({
  selectedProfile: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
});

const emit = defineEmits(["login", "goBack"]);

const password = ref("");
const showPassword = ref(false);

function submit() {
  emit("login", password.value);
}
</script>

<template>
  <div class="p-6">
    <button
      @click="$emit('goBack')"
      class="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors duration-200"
    >
      <span>←</span>
      <span>Voltar</span>
    </button>

    <div class="flex items-center gap-5 mb-8">
      <div
        class="w-18 h-18 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl"
        :style="{
          backgroundColor: selectedProfile?.avatarColor,
          boxShadow: `0 10px 40px ${selectedProfile?.avatarColor}40`,
        }"
      >
        {{ selectedProfile?.displayName?.substring(0, 2).toUpperCase() }}
      </div>
      <div>
        <h2 class="text-xl font-bold text-white">
          {{ selectedProfile?.displayName }}
        </h2>
        <p class="text-gray-400">@{{ selectedProfile?.username }}</p>
      </div>
    </div>

    <form @submit.prevent="submit" class="space-y-5">
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300"
          >Senha</label
        >
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 pr-12"
            placeholder="Digite sua senha"
            autofocus
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors duration-200"
          >
            {{ showPassword ? "👁️" : "👁️‍🗨️" }}
          </button>
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
        <span v-else>Entrar</span>
      </button>
    </form>
  </div>
</template>
