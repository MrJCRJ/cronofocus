<template>
  <div :class="cardClasses" v-bind="$attrs">
    <!-- Header -->
    <div v-if="$slots.header || title" class="glass-card-header">
      <slot name="header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span v-if="icon" class="text-2xl">{{ icon }}</span>
            <div>
              <h3 class="font-semibold text-white">{{ title }}</h3>
              <p v-if="subtitle" class="text-sm text-gray-400">
                {{ subtitle }}
              </p>
            </div>
          </div>
          <slot name="header-actions" />
        </div>
      </slot>
    </div>

    <!-- Body -->
    <div :class="bodyClasses">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="glass-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (value) =>
      ["default", "solid", "bordered", "glow"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  title: {
    type: String,
    default: null,
  },
  subtitle: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  noPadding: {
    type: Boolean,
    default: false,
  },
});

const cardClasses = computed(() => {
  const classes = ["glass-card-wrapper", "overflow-hidden"];

  // Variant
  const variants = {
    default: ["bg-white/5", "backdrop-blur-xl", "border", "border-white/10"],
    solid: ["bg-gray-800/90", "border", "border-gray-700"],
    bordered: ["bg-transparent", "border-2", "border-white/20"],
    glow: [
      "bg-white/5",
      "backdrop-blur-xl",
      "border",
      "border-indigo-500/30",
      "shadow-lg",
      "shadow-indigo-500/10",
    ],
  };

  classes.push(...(variants[props.variant] || variants.default));

  // Size (border-radius)
  const sizes = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
  };
  classes.push(sizes[props.size]);

  // Hoverable
  if (props.hoverable) {
    classes.push(
      "transition-all",
      "duration-300",
      "hover:bg-white/10",
      "hover:border-white/20",
      "hover:shadow-xl",
      "hover:-translate-y-1"
    );
  }

  // Clickable
  if (props.clickable) {
    classes.push("cursor-pointer");
  }

  return classes;
});

const bodyClasses = computed(() => {
  const classes = ["glass-card-body"];

  if (!props.noPadding) {
    const paddings = {
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };
    classes.push(paddings[props.size]);
  }

  return classes;
});
</script>

<style scoped>
.glass-card-wrapper {
  position: relative;
}

.glass-card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.glass-card-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}
</style>
