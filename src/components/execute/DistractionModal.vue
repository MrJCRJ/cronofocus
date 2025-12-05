<script setup>
/**
 * DistractionModal - Modal para registrar distrações
 */
import { ref } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const note = ref("");

function submit() {
  if (note.value.trim()) {
    emit("submit", note.value.trim());
    note.value = "";
  }
}

function close() {
  note.value = "";
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="close"
      />
      <div class="relative glass-card p-6 w-full max-w-md animate-slide-up">
        <h3
          class="text-lg font-semibold mb-4 text-white flex items-center gap-2"
        >
          <span>🚨</span>
          Registrar Distração
        </h3>

        <textarea
          v-model="note"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 mb-4"
          rows="3"
          placeholder="O que te interrompeu?"
          autofocus
        />

        <div class="flex gap-3 justify-end">
          <button @click="close" class="btn-premium btn-glass px-5 py-2.5">
            Cancelar
          </button>
          <button
            @click="submit"
            class="btn-premium btn-gradient-warning px-5 py-2.5"
            :disabled="!note.trim()"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
