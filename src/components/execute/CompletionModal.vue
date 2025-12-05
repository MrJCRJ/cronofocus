<script setup>
/**
 * CompletionModal - Modal de conclusão de tarefa
 */
import { ref } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  elapsedMinutes: {
    type: Number,
    default: 0,
  },
  plannedMinutes: {
    type: Number,
    default: 0,
  },
  distractionCount: {
    type: Number,
    default: 0,
  },
  formattedElapsed: {
    type: String,
    default: "0min",
  },
});

const emit = defineEmits(["complete", "skip"]);

const rating = ref(3);
const notes = ref("");

function formatMinutes(min) {
  if (min < 60) return `${min}min`;
  const hours = Math.floor(min / 60);
  const mins = min % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function complete() {
  emit("complete", {
    rating: rating.value,
    notes: notes.value,
  });
  rating.value = 3;
  notes.value = "";
}

function skip() {
  emit("skip");
  rating.value = 3;
  notes.value = "";
}

const efficiency = computed(() => {
  if (!props.plannedMinutes) return 0;
  return Math.round((props.elapsedMinutes / props.plannedMinutes) * 100);
});
</script>

<script>
import { computed } from "vue";
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div class="relative glass-card p-8 w-full max-w-md animate-slide-up">
        <div class="text-center mb-8">
          <div class="text-7xl mb-4 animate-bounce">🎉</div>
          <h3 class="text-3xl font-bold mb-2 text-white">Tarefa Concluída!</h3>
          <p class="text-gray-400">{{ formattedElapsed }} de foco total</p>
        </div>

        <!-- Rating -->
        <div class="mb-8">
          <label
            class="block text-sm font-medium mb-4 text-center text-gray-300"
          >
            Como foi sua sessão?
          </label>
          <div class="flex justify-center gap-3">
            <button
              v-for="i in 5"
              :key="i"
              @click="rating = i"
              :class="[
                'text-4xl transition-all duration-300 hover:scale-125',
                i <= rating
                  ? 'opacity-100 scale-110 drop-shadow-lg'
                  : 'opacity-40 grayscale hover:opacity-70',
              ]"
            >
              ⭐
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-8">
          <label class="block text-sm font-medium mb-2 text-gray-300">
            Notas (opcional)
          </label>
          <textarea
            v-model="notes"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            rows="2"
            placeholder="O que você realizou? Alguma observação?"
          />
        </div>

        <!-- Summary -->
        <div class="glass-card bg-white/5 p-5 mb-8">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 text-xs uppercase tracking-wide"
                >Tempo Real</span
              >
              <p class="font-bold text-lg text-white mt-1">
                {{ formatMinutes(elapsedMinutes) }}
              </p>
            </div>
            <div>
              <span class="text-gray-500 text-xs uppercase tracking-wide"
                >Planejado</span
              >
              <p class="font-bold text-lg text-white mt-1">
                {{ formatMinutes(plannedMinutes) }}
              </p>
            </div>
            <div>
              <span class="text-gray-500 text-xs uppercase tracking-wide"
                >Distrações</span
              >
              <p
                class="font-bold text-lg mt-1"
                :class="distractionCount > 0 ? 'text-amber-400' : 'text-white'"
              >
                {{ distractionCount }}
              </p>
            </div>
            <div>
              <span class="text-gray-500 text-xs uppercase tracking-wide"
                >Eficiência</span
              >
              <p class="font-bold text-lg text-emerald-400 mt-1">
                {{ efficiency }}%
              </p>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button @click="skip" class="btn-premium btn-glass flex-1 py-3">
            Descartar
          </button>
          <button
            @click="complete"
            class="btn-premium btn-gradient-success flex-1 py-3"
          >
            ✅ Concluir
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
