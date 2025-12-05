<template>
  <div
    class="toast-wrapper"
    :class="[positionClasses, { 'pointer-events-none': toasts.length === 0 }]"
  >
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast-item', `toast-${toast.type}`, 'pointer-events-auto']"
      >
        <!-- Icon -->
        <div class="toast-icon">
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            v-else-if="toast.type === 'error'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <svg
            v-else-if="toast.type === 'warning'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Content -->
        <div class="toast-content">
          <p v-if="toast.title" class="toast-title">{{ toast.title }}</p>
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <!-- Close button -->
        <button @click="remove(toast.id)" class="toast-close">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Progress bar -->
        <div
          v-if="toast.duration"
          class="toast-progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  position: {
    type: String,
    default: "bottom-right",
    validator: (value) =>
      [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ].includes(value),
  },
});

const toasts = ref([]);
let toastId = 0;

const positionClasses = computed(() => {
  const positions = {
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };
  return positions[props.position];
});

const add = (options) => {
  const toast = {
    id: toastId++,
    type: options.type || "info",
    title: options.title || null,
    message: options.message || "",
    duration: options.duration !== undefined ? options.duration : 5000,
  };

  toasts.value.push(toast);

  if (toast.duration > 0) {
    setTimeout(() => {
      remove(toast.id);
    }, toast.duration);
  }

  return toast.id;
};

const remove = (id) => {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const clear = () => {
  toasts.value = [];
};

// Expose methods
defineExpose({
  add,
  remove,
  clear,
  success: (message, options = {}) =>
    add({ ...options, type: "success", message }),
  error: (message, options = {}) => add({ ...options, type: "error", message }),
  warning: (message, options = {}) =>
    add({ ...options, type: "warning", message }),
  info: (message, options = {}) => add({ ...options, type: "info", message }),
});
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  z-index: 1000;
  max-width: 400px;
  width: 100%;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.toast-success {
  border-left: 3px solid #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-success .toast-progress {
  background: #10b981;
}

.toast-error {
  border-left: 3px solid #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-error .toast-progress {
  background: #ef4444;
}

.toast-warning {
  border-left: 3px solid #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-warning .toast-progress {
  background: #f59e0b;
}

.toast-info {
  border-left: 3px solid #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-info .toast-progress {
  background: #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.875rem;
  color: #94a3b8;
}

.toast-close {
  flex-shrink: 0;
  padding: 0.25rem;
  color: #64748b;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: progress linear forwards;
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
