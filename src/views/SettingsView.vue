<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useNotifications } from "@/composables/useNotifications";

const router = useRouter();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const notifications = useNotifications();

const activeTab = ref("profile");
const loading = ref(false);
const success = ref("");
const error = ref("");

// Profile form
const profileForm = ref({
  displayName: "",
  avatarColor: "",
});

// Password form
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

// Settings
const settings = computed(() => settingsStore.settings);

// Tab items
const tabs = [
  { id: "profile", name: "Perfil", icon: "👤" },
  { id: "preferences", name: "Preferências", icon: "⚙️" },
  { id: "notifications", name: "Notificações", icon: "🔔" },
  { id: "data", name: "Dados", icon: "💾" },
];

// Update profile
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

// Update password
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

// Update setting
async function updateSetting(key, value) {
  try {
    await settingsStore.updateSetting(key, value);
  } catch (err) {
    error.value = err.message;
  }
}

// Request notification permission
async function requestNotifications() {
  const granted = await notifications.requestPermission();
  if (granted) {
    await updateSetting("notificationsEnabled", true);
    success.value = "Notificações ativadas!";
    setTimeout(() => (success.value = ""), 3000);
  }
}

// Delete account
async function deleteAccount() {
  if (
    !confirm(
      "Tem certeza que deseja excluir sua conta? Todos os dados serão perdidos."
    )
  )
    return;
  if (!confirm("Esta ação é IRREVERSÍVEL. Confirma a exclusão?")) return;

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

// Logout
function logout() {
  authStore.logout();
  router.push("/login");
}

// Navigation helper
function goToExport() {
  router.push("/export");
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 pt-16"
  >
    <div class="max-w-4xl mx-auto p-4 lg:p-6">
      <!-- Header -->
      <div class="mb-8 animate-fade-in">
        <h1
          class="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-white"
        >
          <span>⚙️</span>
          Configurações
        </h1>
      </div>

      <!-- Tabs -->
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

      <!-- Messages -->
      <div
        v-if="success"
        class="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3"
      >
        <span>✅</span>
        <span>{{ success }}</span>
      </div>
      <div
        v-if="error"
        class="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3"
      >
        <span>❌</span>
        <span>{{ error }}</span>
      </div>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <div class="glass-card p-6">
          <h3 class="font-semibold mb-6 text-white">Informações do Perfil</h3>

          <!-- Avatar Preview -->
          <div class="flex items-center gap-6 mb-6">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl"
              :style="{
                backgroundColor: profileForm.avatarColor,
                boxShadow: `0 10px 40px ${profileForm.avatarColor}40`,
              }"
            >
              {{
                (profileForm.displayName || "?").substring(0, 2).toUpperCase()
              }}
            </div>
            <div>
              <p class="font-semibold text-lg text-white">
                {{ profileForm.displayName }}
              </p>
              <p class="text-gray-400">@{{ authStore.user?.username }}</p>
            </div>
          </div>

          <form @submit.prevent="updateProfile" class="space-y-5">
            <!-- Display Name -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Nome de Exibição</label
              >
              <input
                v-model="profileForm.displayName"
                type="text"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <!-- Avatar Color -->
            <div>
              <label class="block text-sm font-medium mb-3 text-gray-300"
                >Cor do Avatar</label
              >
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="color in authStore.AVATAR_COLORS"
                  :key="color"
                  type="button"
                  @click="profileForm.avatarColor = color"
                  :class="[
                    'w-11 h-11 rounded-full transition-all duration-300',
                    profileForm.avatarColor === color
                      ? 'ring-3 ring-white ring-offset-3 ring-offset-gray-900 scale-110 shadow-lg'
                      : 'hover:scale-110',
                  ]"
                  :style="{
                    backgroundColor: color,
                    boxShadow:
                      profileForm.avatarColor === color
                        ? `0 0 20px ${color}60`
                        : '',
                  }"
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn-premium btn-primary px-6 py-3"
              :disabled="loading"
            >
              <span v-if="loading" class="animate-spin mr-2">⏳</span>
              Salvar Alterações
            </button>
          </form>
        </div>

        <!-- Password Section -->
        <div v-if="!authStore.isGuest" class="glass-card p-6">
          <h3 class="font-semibold mb-6 text-white">
            {{
              authStore.user?.hasPassword ? "Alterar Senha" : "Definir Senha"
            }}
          </h3>

          <form @submit.prevent="updatePassword" class="space-y-5">
            <div v-if="authStore.user?.hasPassword">
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Senha Atual</label
              >
              <input
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Nova Senha</label
              >
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Confirmar Nova Senha</label
              >
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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
        </div>
      </div>

      <!-- Preferences Tab -->
      <div v-if="activeTab === 'preferences'" class="space-y-6">
        <div class="glass-card p-6">
          <h3 class="font-semibold mb-6 text-white">Preferências de Tempo</h3>

          <div class="space-y-5">
            <!-- Time Interval -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Intervalo de Tempo</label
              >
              <select
                :value="settings.timeInterval"
                @change="
                  updateSetting('timeInterval', Number($event.target.value))
                "
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="15" class="bg-gray-900">15 minutos</option>
                <option value="30" class="bg-gray-900">30 minutos</option>
                <option value="60" class="bg-gray-900">1 hora</option>
              </select>
            </div>

            <!-- Day Start -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Início do Dia</label
              >
              <select
                :value="settings.dayStartHour"
                @change="
                  updateSetting('dayStartHour', Number($event.target.value))
                "
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option
                  v-for="h in 24"
                  :key="h - 1"
                  :value="h - 1"
                  class="bg-gray-900"
                >
                  {{ (h - 1).toString().padStart(2, "0") }}:00
                </option>
              </select>
            </div>

            <!-- Day End -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Fim do Dia</label
              >
              <select
                :value="settings.dayEndHour"
                @change="
                  updateSetting('dayEndHour', Number($event.target.value))
                "
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option v-for="h in 24" :key="h" :value="h" class="bg-gray-900">
                  {{ h.toString().padStart(2, "0") }}:00
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="glass-card p-6">
          <h3 class="font-semibold mb-6 text-white">Formato de Data e Hora</h3>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Formato de Data</label
              >
              <select
                :value="settings.dateFormat"
                @change="updateSetting('dateFormat', $event.target.value)"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="DD/MM/YYYY" class="bg-gray-900">
                  DD/MM/YYYY
                </option>
                <option value="MM/DD/YYYY" class="bg-gray-900">
                  MM/DD/YYYY
                </option>
                <option value="YYYY-MM-DD" class="bg-gray-900">
                  YYYY-MM-DD
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Formato de Hora</label
              >
              <select
                :value="settings.timeFormat"
                @change="updateSetting('timeFormat', $event.target.value)"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="24h" class="bg-gray-900">
                  24 horas (14:00)
                </option>
                <option value="12h" class="bg-gray-900">
                  12 horas (2:00 PM)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Tab -->
      <div v-if="activeTab === 'notifications'" class="space-y-6">
        <div class="glass-card p-6">
          <h3 class="font-semibold mb-6 text-white">Notificações</h3>

          <div class="space-y-6">
            <!-- Enable Notifications -->
            <div
              class="flex items-center justify-between p-4 bg-white/5 rounded-xl"
            >
              <div>
                <p class="font-medium text-white">Ativar Notificações</p>
                <p class="text-sm text-gray-400">
                  Receba lembretes antes das tarefas
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="settings.notificationsEnabled"
                  @change="
                    settings.notificationsEnabled
                      ? updateSetting('notificationsEnabled', false)
                      : requestNotifications()
                  "
                  class="sr-only peer"
                />
                <div
                  class="w-12 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                ></div>
              </label>
            </div>

            <!-- Enable Sounds -->
            <div
              class="flex items-center justify-between p-4 bg-white/5 rounded-xl"
            >
              <div>
                <p class="font-medium text-white">Sons de Notificação</p>
                <p class="text-sm text-gray-400">Tocar som junto com alertas</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="settings.soundEnabled"
                  @change="
                    updateSetting('soundEnabled', !settings.soundEnabled)
                  "
                  class="sr-only peer"
                />
                <div
                  class="w-12 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                ></div>
              </label>
            </div>

            <!-- Sound Volume -->
            <div v-if="settings.soundEnabled" class="p-4 bg-white/5 rounded-xl">
              <label class="block text-sm font-medium mb-3 text-gray-300">
                Volume:
                <span class="text-primary font-bold"
                  >{{ Math.round(settings.soundVolume * 100) }}%</span
                >
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                :value="settings.soundVolume"
                @change="
                  updateSetting('soundVolume', Number($event.target.value))
                "
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <!-- Reminder Time -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Lembrete Antes da Tarefa</label
              >
              <select
                :value="settings.reminderMinutes"
                @change="
                  updateSetting('reminderMinutes', Number($event.target.value))
                "
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="1" class="bg-gray-900">1 minuto</option>
                <option value="5" class="bg-gray-900">5 minutos</option>
                <option value="10" class="bg-gray-900">10 minutos</option>
                <option value="15" class="bg-gray-900">15 minutos</option>
                <option value="30" class="bg-gray-900">30 minutos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Tab -->
      <div v-if="activeTab === 'data'" class="space-y-6">
        <div class="glass-card p-6">
          <h3 class="font-semibold mb-6 text-white">Gerenciamento de Dados</h3>

          <div class="space-y-4">
            <button
              @click="goToExport"
              class="btn-premium btn-glass w-full justify-start px-5 py-4 text-left"
            >
              <span class="mr-3 text-xl">📤</span>
              <span>Exportar Meus Dados</span>
            </button>

            <button
              class="btn-premium btn-glass w-full justify-start px-5 py-4 text-left"
            >
              <span class="mr-3 text-xl">📥</span>
              <span>Importar Backup</span>
            </button>
          </div>
        </div>

        <div class="glass-card p-6 border-red-500/30">
          <h3 class="font-semibold mb-4 text-red-400">🚨 Zona de Perigo</h3>

          <div class="space-y-4">
            <button
              @click="logout"
              class="btn-premium btn-glass w-full justify-start px-5 py-4 text-left text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            >
              <span class="mr-3 text-xl">🚪</span>
              <span>Sair da Conta</span>
            </button>

            <button
              @click="deleteAccount"
              class="btn-premium btn-danger w-full justify-start px-5 py-4 text-left"
              :disabled="loading"
            >
              <span class="mr-3 text-xl">🗑️</span>
              <span>Excluir Minha Conta</span>
            </button>

            <p class="text-xs text-gray-500">
              A exclusão da conta é permanente e todos os dados serão perdidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
