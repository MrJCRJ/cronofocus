<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    ref="buttonRef"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="btn-loading-spinner">
      <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>

    <!-- Left icon -->
    <span v-if="iconLeft && !loading" class="btn-icon-left">
      <component :is="getIconComponent(iconLeft)" class="w-5 h-5" />
    </span>

    <!-- Content -->
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>

    <!-- Right icon -->
    <span v-if="iconRight && !loading" class="btn-icon-right">
      <component :is="getIconComponent(iconRight)" class="w-5 h-5" />
    </span>

    <!-- Ripple container -->
    <span v-if="ripple" class="ripple-container" ref="rippleContainer"></span>
  </button>
</template>

<script setup>
import { ref, computed, h } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "outline",
        "ghost",
        "glass",
      ].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  circle: {
    type: Boolean,
    default: false,
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  ripple: {
    type: Boolean,
    default: true,
  },
  iconLeft: {
    type: String,
    default: null,
  },
  iconRight: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["click"]);

const buttonRef = ref(null);
const rippleContainer = ref(null);

const buttonClasses = computed(() => {
  const base = [
    "btn-premium",
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "font-semibold",
    "transition-all",
    "duration-200",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-offset-gray-900",
  ];

  // Variant classes
  const variants = {
    primary: [
      "bg-linear-to-r",
      "from-indigo-500",
      "to-purple-600",
      "text-white",
      "border-transparent",
      "hover:shadow-lg",
      "hover:shadow-indigo-500/25",
      "focus:ring-indigo-500",
    ],
    secondary: [
      "bg-white/10",
      "text-white",
      "border",
      "border-white/20",
      "backdrop-blur-sm",
      "hover:bg-white/20",
      "hover:border-white/30",
      "focus:ring-white/50",
    ],
    success: [
      "bg-linear-to-r",
      "from-emerald-500",
      "to-green-500",
      "text-white",
      "border-transparent",
      "hover:shadow-lg",
      "hover:shadow-emerald-500/25",
      "focus:ring-emerald-500",
    ],
    danger: [
      "bg-linear-to-r",
      "from-rose-500",
      "to-pink-500",
      "text-white",
      "border-transparent",
      "hover:shadow-lg",
      "hover:shadow-rose-500/25",
      "focus:ring-rose-500",
    ],
    warning: [
      "bg-linear-to-r",
      "from-amber-500",
      "to-orange-500",
      "text-white",
      "border-transparent",
      "hover:shadow-lg",
      "hover:shadow-amber-500/25",
      "focus:ring-amber-500",
    ],
    info: [
      "bg-linear-to-r",
      "from-blue-500",
      "to-cyan-500",
      "text-white",
      "border-transparent",
      "hover:shadow-lg",
      "hover:shadow-blue-500/25",
      "focus:ring-blue-500",
    ],
    outline: [
      "bg-transparent",
      "text-indigo-400",
      "border",
      "border-indigo-500/30",
      "hover:bg-indigo-500/10",
      "hover:border-indigo-400",
      "focus:ring-indigo-500",
    ],
    ghost: [
      "bg-transparent",
      "text-gray-400",
      "border-transparent",
      "hover:bg-white/5",
      "hover:text-white",
      "focus:ring-gray-500",
    ],
    glass: [
      "bg-white/5",
      "text-white",
      "border",
      "border-white/10",
      "backdrop-blur-xl",
      "hover:bg-white/10",
      "hover:border-white/20",
      "focus:ring-white/30",
    ],
  };

  // Size classes
  const sizes = {
    xs: ["px-2.5", "py-1.5", "text-xs", "rounded-md"],
    sm: ["px-3", "py-2", "text-sm", "rounded-lg"],
    md: ["px-4", "py-2.5", "text-sm", "rounded-xl"],
    lg: ["px-6", "py-3", "text-base", "rounded-xl"],
    xl: ["px-8", "py-4", "text-lg", "rounded-2xl"],
  };

  // Icon only sizes
  const iconSizes = {
    xs: ["p-1.5", "rounded-md"],
    sm: ["p-2", "rounded-lg"],
    md: ["p-2.5", "rounded-xl"],
    lg: ["p-3", "rounded-xl"],
    xl: ["p-4", "rounded-2xl"],
  };

  const classes = [...base];

  // Add variant
  if (variants[props.variant]) {
    classes.push(...variants[props.variant]);
  }

  // Add size
  if (props.iconOnly) {
    classes.push(...iconSizes[props.size]);
  } else {
    classes.push(...sizes[props.size]);
  }

  // Add modifiers
  if (props.block) {
    classes.push("w-full");
  }

  if (props.circle) {
    classes.push("rounded-full", "aspect-square");
  }

  if (props.disabled || props.loading) {
    classes.push("opacity-50", "cursor-not-allowed", "pointer-events-none");
  } else {
    classes.push(
      "hover:-translate-y-0.5",
      "active:translate-y-0",
      "active:scale-95"
    );
  }

  return classes;
});

const handleClick = (event) => {
  if (props.disabled || props.loading) return;

  // Create ripple effect
  if (props.ripple && rippleContainer.value) {
    createRipple(event);
  }

  emit("click", event);
};

const createRipple = (event) => {
  const button = buttonRef.value;
  const container = rippleContainer.value;

  if (!button || !container) return;

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement("span");
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  `;

  container.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
};

// Icon components
const getIconComponent = (iconName) => {
  const icons = {
    plus: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M12 4v16m8-8H4",
        }),
      ]),
    check: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M5 13l4 4L19 7",
        }),
      ]),
    x: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M6 18L18 6M6 6l12 12",
        }),
      ]),
    trash: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
        }),
      ]),
    edit: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
        }),
      ]),
    settings: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
        }),
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        }),
      ]),
    timer: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        }),
      ]),
    export: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
        }),
      ]),
    play: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z",
        }),
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        }),
      ]),
    pause: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z",
        }),
      ]),
    stop: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        }),
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
        }),
      ]),
    calendar: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
        }),
      ]),
    chart: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        }),
      ]),
    save: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4",
        }),
      ]),
    refresh: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
        }),
      ]),
    logout: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
        }),
      ]),
    home: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
        }),
      ]),
    arrow_left: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M10 19l-7-7m0 0l7-7m-7 7h18",
        }),
      ]),
    arrow_right: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M14 5l7 7m0 0l-7 7m7-7H3",
        }),
      ]),
    chevron_down: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M19 9l-7 7-7-7",
        }),
      ]),
    bell: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
        }),
      ]),
    download: () =>
      h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
        }),
      ]),
  };

  return icons[iconName] || icons.plus;
};
</script>

<style scoped>
.btn-premium {
  position: relative;
  overflow: hidden;
}

.btn-loading-spinner {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-left,
.btn-icon-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ripple-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
