<script setup>
/**
 * TimerDisplay - Círculo do timer com progresso
 */
import { computed } from "vue";

const props = defineProps({
  formattedTime: {
    type: String,
    default: "00:00",
  },
  progress: {
    type: Number,
    default: 0,
  },
  isPaused: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "#6366f1",
  },
});

const ringCircumference = 2 * Math.PI * 140;
const ringOffset = computed(() => {
  return ringCircumference - (props.progress / 100) * ringCircumference;
});
</script>

<template>
  <div class="timer-ring relative mb-10">
    <svg viewBox="0 0 300 300" class="w-full h-full drop-shadow-2xl">
      <!-- Background ring -->
      <circle cx="150" cy="150" r="140" class="timer-ring-bg" />
      <!-- Progress ring -->
      <circle
        cx="150"
        cy="150"
        r="140"
        class="timer-ring-progress"
        :style="{
          strokeDasharray: ringCircumference,
          strokeDashoffset: ringOffset,
          stroke: color,
          filter: `drop-shadow(0 0 20px ${color}60)`,
        }"
      />
    </svg>

    <!-- Timer Display -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <div class="timer-display-text text-white">
        {{ formattedTime }}
      </div>
      <div class="text-gray-400 text-sm font-medium">
        {{ isPaused ? "⏸ Pausado" : "⏱ Restante" }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-ring {
  width: 280px;
  height: 280px;
}

@media (min-width: 640px) {
  .timer-ring {
    width: 320px;
    height: 320px;
  }
}

.timer-ring svg {
  transform: rotate(-90deg);
}

.timer-ring-bg {
  fill: none;
  stroke: var(--bg-tertiary, #334155);
  stroke-width: 8;
}

.timer-ring-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.timer-display-text {
  font-size: 3.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.05em;
  background: linear-gradient(
    135deg,
    var(--text-primary),
    var(--text-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (min-width: 640px) {
  .timer-display-text {
    font-size: 4.5rem;
  }
}
</style>
