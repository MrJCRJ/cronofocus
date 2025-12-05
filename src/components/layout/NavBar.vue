<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

const showMobileMenu = ref(false);
const showUserMenu = ref(false);

const navItems = [
  { name: "Home", path: "/home", icon: "🏠", label: "Agenda" },
  { name: "Plan", path: "/plan", icon: "📅", label: "Planejar" },
  { name: "Execute", path: "/execute", icon: "▶️", label: "Executar" },
  { name: "Review", path: "/review", icon: "📊", label: "Análise" },
  { name: "History", path: "/history", icon: "📜", label: "Histórico" },
  { name: "Export", path: "/export", icon: "📤", label: "Exportar" },
];

const currentDate = computed(() => {
  return settingsStore.formatDate(timeStore.selectedDate);
});

const dayProgress = computed(() => timeStore.dayProgress);

function isActive(path) {
  return route.path === path;
}

function navigate(path) {
  router.push(path);
  showMobileMenu.value = false;
}

function logout() {
  authStore.logout();
  router.push("/login");
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="!showMobileMenu"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <router-link to="/home" class="flex items-center gap-2 group">
            <div
              class="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow"
            >
              <span class="text-xl">⏱️</span>
            </div>
            <span
              class="font-bold text-lg hidden sm:block bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
            >
              CronoFocus
            </span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div
          class="hidden lg:flex items-center gap-1 p-1 bg-white/5 rounded-xl backdrop-blur-sm"
        >
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="navigate(item.path)"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.path)
                ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'hover:bg-white/10 text-gray-400 hover:text-white',
            ]"
          >
            <span class="mr-2">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-4">
          <!-- Date & Progress -->
          <div
            class="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl"
          >
            <span class="text-sm text-gray-400">{{ currentDate }}</span>
            <div class="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-linear-to-r from-emerald-500 to-green-400 transition-all duration-500 rounded-full"
                :style="{ width: `${dayProgress}%` }"
              />
            </div>
            <span class="text-xs font-medium text-emerald-400"
              >{{ dayProgress }}%</span
            >
          </div>

          <!-- User Menu -->
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-lg"
                :style="{
                  backgroundColor: authStore.user?.avatarColor || '#6366f1',
                }"
              >
                {{ authStore.initials }}
              </div>
              <svg
                class="w-4 h-4 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': showUserMenu }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 scale-95 -translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-2"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl py-2 overflow-hidden"
              >
                <div class="px-4 py-3 bg-white/5">
                  <p class="font-medium text-white">
                    {{ authStore.user?.displayName }}
                  </p>
                  <p class="text-sm text-gray-400">
                    @{{ authStore.user?.username }}
                  </p>
                </div>

                <button
                  @click="
                    navigate('/settings');
                    showUserMenu = false;
                  "
                  class="w-full px-4 py-2.5 text-left hover:bg-white/10 flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <span>⚙️</span>
                  <span>Configurações</span>
                </button>

                <button
                  @click="logout"
                  class="w-full px-4 py-2.5 text-left hover:bg-red-500/10 flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors"
                >
                  <span>🚪</span>
                  <span>Sair</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showMobileMenu"
        class="lg:hidden bg-gray-900/95 backdrop-blur-xl py-2"
      >
        <button
          v-for="item in navItems"
          :key="item.name"
          @click="navigate(item.path)"
          :class="[
            'w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200',
            isActive(item.path)
              ? 'bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500'
              : 'hover:bg-white/5 text-gray-400 hover:text-white',
          ]"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </button>
      </div>
    </Transition>
  </nav>

  <!-- Overlay para fechar menus -->
  <div
    v-if="showUserMenu || showMobileMenu"
    class="fixed inset-0 z-40"
    @click="
      showUserMenu = false;
      showMobileMenu = false;
    "
  />
</template>
