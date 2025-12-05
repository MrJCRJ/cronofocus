<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const mode = ref("select"); // 'select', 'login', 'register'
const profiles = ref([]);
const selectedProfile = ref(null);
const loading = ref(false);
const errorMessage = ref("");

// Form states
const loginForm = ref({
  password: "",
});

const registerForm = ref({
  username: "",
  displayName: "",
  password: "",
  confirmPassword: "",
  avatarColor: "#3b82f6",
  usePassword: false,
});

const showPassword = ref(false);

// Avatar color options
const avatarColors = authStore.AVATAR_COLORS;

// Load profiles on mount
async function loadProfiles() {
  loading.value = true;
  profiles.value = await authStore.listProfiles();
  loading.value = false;

  if (profiles.value.length === 0) {
    mode.value = "register";
  }
}

loadProfiles();

// Methods
async function selectProfile(profile) {
  selectedProfile.value = profile;

  if (profile.hasPassword) {
    mode.value = "login";
  } else {
    await login();
  }
}

async function login() {
  try {
    loading.value = true;
    errorMessage.value = "";

    await authStore.login(
      selectedProfile.value.username,
      selectedProfile.value.hasPassword ? loginForm.value.password : null
    );

    router.push("/home");
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

async function register() {
  try {
    // Validações
    if (!registerForm.value.username) {
      errorMessage.value = "Nome de usuário é obrigatório";
      return;
    }

    if (registerForm.value.username.length < 3) {
      errorMessage.value = "Nome de usuário deve ter pelo menos 3 caracteres";
      return;
    }

    if (registerForm.value.usePassword) {
      if (!registerForm.value.password) {
        errorMessage.value = "Senha é obrigatória";
        return;
      }

      if (registerForm.value.password !== registerForm.value.confirmPassword) {
        errorMessage.value = "Senhas não coincidem";
        return;
      }
    }

    loading.value = true;
    errorMessage.value = "";

    await authStore.register({
      username: registerForm.value.username,
      displayName:
        registerForm.value.displayName || registerForm.value.username,
      avatarColor: registerForm.value.avatarColor,
      password: registerForm.value.usePassword
        ? registerForm.value.password
        : null,
    });

    router.push("/home");
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

async function useAsGuest() {
  await authStore.useGuestMode();
  router.push("/home");
}

function goBack() {
  mode.value = "select";
  selectedProfile.value = null;
  loginForm.value.password = "";
  errorMessage.value = "";
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-in">
        <div
          class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-purple-600 shadow-2xl shadow-primary/40 mb-5"
        >
          <span class="text-5xl">⏱️</span>
        </div>
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent"
        >
          CronoFocus
        </h1>
        <p class="text-gray-400 mt-3">Planejador Temporal Inteligente</p>
      </div>

      <!-- Card -->
      <div class="glass-card overflow-hidden">
        <!-- Select Profile Mode -->
        <div v-if="mode === 'select'" class="p-6">
          <h2 class="text-xl font-semibold mb-6 text-center text-white">
            {{ profiles.length > 0 ? "Escolha seu perfil" : "Bem-vindo!" }}
          </h2>

          <!-- Profile List -->
          <div v-if="profiles.length > 0" class="space-y-3 mb-6">
            <button
              v-for="profile in profiles"
              :key="profile.id"
              @click="selectProfile(profile)"
              class="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center gap-4 group border border-white/10 hover:border-primary/30"
            >
              <div
                class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110"
                :style="{
                  backgroundColor: profile.avatarColor,
                  boxShadow: `0 8px 30px ${profile.avatarColor}40`,
                }"
              >
                {{ profile.displayName?.substring(0, 2).toUpperCase() || "?" }}
              </div>
              <div class="flex-1 text-left">
                <p class="font-semibold text-white">
                  {{ profile.displayName }}
                </p>
                <p class="text-sm text-gray-400">@{{ profile.username }}</p>
              </div>
              <div v-if="profile.hasPassword" class="text-gray-500">🔒</div>
            </button>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button
              @click="mode = 'register'"
              class="btn-premium btn-primary w-full py-3.5 text-lg"
            >
              <span class="mr-2">✨</span>
              Criar Novo Perfil
            </button>

            <button
              @click="useAsGuest"
              class="btn-premium btn-glass w-full py-3"
            >
              Continuar como Convidado
            </button>
          </div>
        </div>

        <!-- Login Mode -->
        <div v-else-if="mode === 'login'" class="p-6">
          <button
            @click="goBack"
            class="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors duration-200"
          >
            <span>←</span>
            <span>Voltar</span>
          </button>

          <div class="flex items-center gap-5 mb-8">
            <div
              class="w-18 h-18 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl"
              :style="{
                backgroundColor: selectedProfile?.avatarColor,
                boxShadow: `0 10px 40px ${selectedProfile?.avatarColor}40`,
              }"
            >
              {{ selectedProfile?.displayName?.substring(0, 2).toUpperCase() }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">
                {{ selectedProfile?.displayName }}
              </h2>
              <p class="text-gray-400">@{{ selectedProfile?.username }}</p>
            </div>
          </div>

          <form @submit.prevent="login" class="space-y-5">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Senha</label
              >
              <div class="relative">
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 pr-12"
                  placeholder="Digite sua senha"
                  autofocus
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors duration-200"
                >
                  {{ showPassword ? "👁️" : "👁️‍🗨️" }}
                </button>
              </div>
            </div>

            <p
              v-if="errorMessage"
              class="text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20"
            >
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              class="btn-premium btn-primary w-full py-3.5 text-lg"
              :disabled="loading"
            >
              <span v-if="loading" class="animate-spin mr-2">⏳</span>
              <span v-else>Entrar</span>
            </button>
          </form>
        </div>

        <!-- Register Mode -->
        <div v-else-if="mode === 'register'" class="p-6">
          <button
            v-if="profiles.length > 0"
            @click="goBack"
            class="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors duration-200"
          >
            <span>←</span>
            <span>Voltar</span>
          </button>

          <h2 class="text-xl font-bold mb-6 text-white">Criar Perfil Local</h2>

          <form @submit.prevent="register" class="space-y-5">
            <!-- Avatar Color -->
            <div>
              <label class="block text-sm font-medium mb-3 text-gray-300"
                >Cor do Avatar</label
              >
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="color in avatarColors"
                  :key="color"
                  type="button"
                  @click="registerForm.avatarColor = color"
                  :class="[
                    'w-11 h-11 rounded-full transition-all duration-300',
                    registerForm.avatarColor === color
                      ? 'ring-3 ring-white ring-offset-3 ring-offset-gray-900 scale-110'
                      : 'hover:scale-110',
                  ]"
                  :style="{
                    backgroundColor: color,
                    boxShadow:
                      registerForm.avatarColor === color
                        ? `0 0 20px ${color}60`
                        : '',
                  }"
                />
              </div>
            </div>

            <!-- Preview -->
            <div class="flex justify-center py-4">
              <div
                class="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-2xl transition-all duration-300"
                :style="{
                  backgroundColor: registerForm.avatarColor,
                  boxShadow: `0 20px 60px ${registerForm.avatarColor}50`,
                }"
              >
                {{
                  (registerForm.displayName || registerForm.username || "?")
                    .substring(0, 2)
                    .toUpperCase()
                }}
              </div>
            </div>

            <!-- Username -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300">
                Nome de Usuário <span class="text-red-400">*</span>
              </label>
              <input
                v-model="registerForm.username"
                type="text"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="jose"
                pattern="[a-zA-Z0-9_]+"
              />
              <p class="text-xs text-gray-500 mt-2">
                Apenas letras, números e underscore
              </p>
            </div>

            <!-- Display Name -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300"
                >Nome de Exibição</label
              >
              <input
                v-model="registerForm.displayName"
                type="text"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="José Silva"
              />
            </div>

            <!-- Password Toggle -->
            <div class="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="registerForm.usePassword"
                  class="sr-only peer"
                />
                <div
                  class="w-12 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                ></div>
              </label>
              <span class="text-gray-300">Proteger com senha</span>
            </div>

            <!-- Password Fields -->
            <div
              v-if="registerForm.usePassword"
              class="space-y-4 animate-slide-up"
            >
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-300"
                  >Senha</label
                >
                <input
                  v-model="registerForm.password"
                  type="password"
                  class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-gray-300"
                  >Confirmar Senha</label
                >
                <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <p
              v-if="errorMessage"
              class="text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20"
            >
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              class="btn-premium btn-primary w-full py-3.5 text-lg"
              :disabled="loading"
            >
              <span v-if="loading" class="animate-spin mr-2">⏳</span>
              <span v-else>Criar Perfil</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-gray-500 text-sm mt-8">
        🔒 Seus dados são armazenados localmente no seu dispositivo
      </p>
    </div>
  </div>
</template>
