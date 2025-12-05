<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="closeOnOverlay && close()"
      >
        <div :class="modalClasses" role="dialog" aria-modal="true">
          <!-- Header -->
          <div v-if="!hideHeader" class="modal-header">
            <div class="flex items-center gap-3">
              <span v-if="icon" class="text-2xl">{{ icon }}</span>
              <div>
                <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
                <p v-if="subtitle" class="text-sm text-gray-400 mt-0.5">
                  {{ subtitle }}
                </p>
              </div>
            </div>
            <button
              v-if="closable"
              @click="close"
              class="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <svg
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
            </button>
          </div>

          <!-- Body -->
          <div :class="bodyClasses">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: null,
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg", "xl", "full"].includes(value),
  },
  closable: {
    type: Boolean,
    default: true,
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
  closeOnEscape: {
    type: Boolean,
    default: true,
  },
  hideHeader: {
    type: Boolean,
    default: false,
  },
  noPadding: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "close"]);

const modalClasses = computed(() => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return [
    "modal-content",
    "w-full",
    sizes[props.size],
    "bg-gray-900",
    "border",
    "border-white/10",
    "rounded-2xl",
    "shadow-2xl",
    "overflow-hidden",
  ];
});

const bodyClasses = computed(() => {
  return ["modal-body", props.noPadding ? "" : "p-6"];
});

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

// Handle escape key
const handleKeydown = (e) => {
  if (e.key === "Escape" && props.closeOnEscape && props.modelValue) {
    close();
  }
};

// Lock body scroll when modal is open
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-content {
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
