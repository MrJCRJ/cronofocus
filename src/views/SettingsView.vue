<script setup>
/**
 * SettingsView - Configurações refatorado
 * Componentes: ProfileTab, PreferencesTab, NotificationsTab, DataTab
 */
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useNotifications } from "@/composables/useNotifications";

import ProfileTab from "@/components/settings/ProfileTab.vue";
import PreferencesTab from "@/components/settings/PreferencesTab.vue";
import NotificationsTab from "@/components/settings/NotificationsTab.vue";
import DataTab from "@/components/settings/DataTab.vue";

const router = useRouter();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const notifications = useNotifications();

const activeTab = ref("profile");
const loading = ref(false);
const success = ref("");
const error = ref("");

const profileForm = ref({ displayName: "", avatarColor: "" });
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);

onMounted(() => {
  if (authStore.user) {
    profileForm.value = {
      displayName: authStore.user.displayName || "",
      avatarColor: authStore.user.avatarColor || "#3b82f6",
    };
  }
  notifications.init();
});

const settings = computed(() => settingsStore.settings);

const tabs = [
  { id: "profile", name: "Perfil", icon: "👤" },
  { id: "preferences", name: "Preferências", icon: "⚙️" },
  { id: "notifications", name: "Notificações", icon: "🔔" },
  { id: "data", name: "Dados", icon: "💾" },
];

async function updateProfile() {
  try {
    loading.value = true;
    error.value = "";
    await authStore.updateProfile({
      displayName: profileForm.value.displayName,
      avatarColor: profileForm.value.avatarColor,
    });
    success.value = "Perfil atualizado com sucesso!";
    setTimeout(() => (success.value = ""), 3000);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function updatePassword() {
  try {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      error.value = "Senhas não coincidem";
      return;
    }
    if (authStore.user?.hasPassword) {
      const valid = await authStore.verifyPassword(
        passwordForm.value.currentPassword
      );
      if (!valid) {
        error.value = "Senha atual incorreta";
        return;
      }
    }
    loading.value = true;
    error.value = "";
    await authStore.updateProfile({
      newPassword: passwordForm.value.newPassword,
    });
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    success.value = "Senha atualizada com sucesso!";
    setTimeout(() => (success.value = ""), 3000);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function updateSetting(key, value) {
  try {
    await settingsStore.updateSetting(key, value);
  } catch (err) {
    error.value = err.message;
  }
}

async function requestNotifications() {
  const granted = await notifications.requestPermission();
  if (granted) {
    await updateSetting("notificationsEnabled", true);
    success.value = "Notificações ativadas!";
    setTimeout(() => (success.value = ""), 3000);
  }
}

async function deleteAccount() {
  if (!confirm("Tem certeza que deseja excluir sua conta?")) return;
  if (!confirm("Esta ação é IRREVERSÍVEL. Confirma?")) return;
  try {
    loading.value = true;
    await authStore.deleteAccount();
    router.push("/login");
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function logout() {
  authStore.logout();
  router.push("/login");
}

function goToExport() {
  router.push("/export");
}
</script>

<template>
  <div
    class="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 pt-16"
  >
    <div class="max-w-4xl mx-auto p-4 lg:p-6">
      <div class="mb-8 animate-fade-in">
        <h1
          class="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-white"
        >
          <span>⚙️</span>
          Configurações
        </h1>
      </div>

      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
            activeTab === tab.id
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white',
          ]"
        >
          <span class="mr-1.5">{{ tab.icon }}</span>
          {{ tab.name }}
        </button>
      </div>

      <div
        v-if="success"
        class="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3"
      >
        <span>✅</span><span>{{ success }}</span>
      </div>
      <div
        v-if="error"
        class="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3"
      >
        <span>❌</span><span>{{ error }}</span>
      </div>

      <ProfileTab
        v-if="activeTab === 'profile'"
        v-model:profileForm="profileForm"
        :authStore="authStore"
        :loading="loading"
        @updateProfile="updateProfile"
      >
        <template #password-form>
          <form @submit.prevent="updatePassword" class="space-y-5">
            <div v-if="authStore.user?.hasPassword">
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Senha Atual</label
              >
              <input
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="w-full bg-white/5 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Nova Senha</label
              >
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="w-full bg-white/5 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Confirmar Nova Senha</label
              >
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full bg-white/5 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              type="submit"
              class="btn-premium btn-primary px-6 py-3"
              :disabled="loading"
            >
              {{
                authStore.user?.hasPassword ? "Alterar Senha" : "Definir Senha"
              }}
            </button>
          </form>
        </template>
      </ProfileTab>

      <PreferencesTab
        v-if="activeTab === 'preferences'"
        :settings="settings"
        @updateSetting="updateSetting"
      />
      <NotificationsTab
        v-if="activeTab === 'notifications'"
        :settings="settings"
        @updateSetting="updateSetting"
        @requestNotifications="requestNotifications"
      />
      <DataTab
        v-if="activeTab === 'data'"
        :loading="loading"
        @goToExport="goToExport"
        @logout="logout"
        @deleteAccount="deleteAccount"
      />
    </div>
  </div>
</template>
