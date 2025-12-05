<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import NavBar from "@/components/layout/NavBar.vue";

const route = useRoute();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

// Check if current route requires NavBar (not login page)
const showNavBar = computed(() => {
  return route.meta.requiresAuth !== false && authStore.isLoggedIn;
});

// Initialize on mount
onMounted(async () => {
  // Try to restore session
  await authStore.restoreSession();

  // Load settings if logged in
  if (authStore.isLoggedIn) {
    await settingsStore.loadSettings(authStore.user?.id);
  }
});

// Watch for auth changes
watch(
  () => authStore.isLoggedIn,
  async (isLoggedIn) => {
    if (isLoggedIn && authStore.user) {
      await settingsStore.loadSettings(authStore.user.id);
    }
  }
);
</script>

<template>
  <div class="min-h-screen bg-base-100" data-theme="dark">
    <!-- Navigation Bar -->
    <NavBar v-if="showNavBar" />

    <!-- Main Content -->
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- PWA Install Prompt -->
    <div
      v-if="false"
      class="fixed bottom-4 left-4 right-4 bg-base-200 rounded-2xl border border-base-300 p-4 flex items-center justify-between z-50"
    >
      <div>
        <p class="font-medium">Instalar CronoFocus</p>
        <p class="text-sm text-base-content/60">
          Acesse offline e receba notificações
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-sm btn-ghost">Depois</button>
        <button class="btn btn-sm btn-primary">Instalar</button>
      </div>
    </div>
  </div>
</template>

<style>
/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
