<script setup>
/**
 * LoginView - Login refatorado
 * Componentes: ProfileSelector, LoginForm, RegisterForm
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import ProfileSelector from '@/components/login/ProfileSelector.vue'
import LoginForm from '@/components/login/LoginForm.vue'
import RegisterForm from '@/components/login/RegisterForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('select')
const profiles = ref([])
const selectedProfile = ref(null)
const loading = ref(false)
const errorMessage = ref('')

async function loadProfiles() {
  loading.value = true
  profiles.value = await authStore.listProfiles()
  loading.value = false
  if (profiles.value.length === 0) mode.value = 'register'
}

loadProfiles()

async function selectProfile(profile) {
  selectedProfile.value = profile
  if (profile.hasPassword) {
    mode.value = 'login'
  } else {
    await login()
  }
}

async function login(password = null) {
  try {
    loading.value = true
    errorMessage.value = ''
    await authStore.login(selectedProfile.value.username, password)
    router.push('/home')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

async function register(formData) {
  try {
    if (!formData.username) {
      errorMessage.value = 'Nome de usuário é obrigatório'
      return
    }
    if (formData.username.length < 3) {
      errorMessage.value = 'Nome de usuário deve ter pelo menos 3 caracteres'
      return
    }
    if (formData.usePassword) {
      if (!formData.password) {
        errorMessage.value = 'Senha é obrigatória'
        return
      }
      if (formData.password !== formData.confirmPassword) {
        errorMessage.value = 'Senhas não coincidem'
        return
      }
    }

    loading.value = true
    errorMessage.value = ''
    await authStore.register({
      username: formData.username,
      displayName: formData.displayName || formData.username,
      avatarColor: formData.avatarColor,
      password: formData.usePassword ? formData.password : null
    })
    router.push('/home')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

async function useAsGuest() {
  await authStore.useGuestMode()
  router.push('/home')
}

function goBack() {
  mode.value = 'select'
  selectedProfile.value = null
  errorMessage.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-purple-600 shadow-2xl shadow-primary/40 mb-5">
          <span class="text-5xl">⏱️</span>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          CronoFocus
        </h1>
        <p class="text-gray-400 mt-3">Planejador Temporal Inteligente</p>
      </div>

      <!-- Card -->
      <div class="glass-card overflow-hidden">
        <ProfileSelector
          v-if="mode === 'select'"
          :profiles="profiles"
          @selectProfile="selectProfile"
          @createNew="mode = 'register'"
          @useAsGuest="useAsGuest"
        />

        <LoginForm
          v-else-if="mode === 'login'"
          :selectedProfile="selectedProfile"
          :loading="loading"
          :errorMessage="errorMessage"
          @login="login"
          @goBack="goBack"
        />

        <RegisterForm
          v-else-if="mode === 'register'"
          :avatarColors="authStore.AVATAR_COLORS"
          :hasProfiles="profiles.length > 0"
          :loading="loading"
          :errorMessage="errorMessage"
          @register="register"
          @goBack="goBack"
        />
      </div>

      <p class="text-center text-gray-500 text-sm mt-8">
        🔒 Seus dados são armazenados localmente no seu dispositivo
      </p>
    </div>
  </div>
</template>
