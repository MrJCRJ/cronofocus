<script setup>
/**
 * PreferencesTab - Aba de preferências de tempo e formato
 */
const props = defineProps({
  settings: { type: Object, required: true },
});

const emit = defineEmits(["updateSetting"]);

function update(key, value) {
  emit("updateSetting", key, value);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Time Preferences -->
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
            @change="update('timeInterval', Number($event.target.value))"
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
            @change="update('dayStartHour', Number($event.target.value))"
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
            @change="update('dayEndHour', Number($event.target.value))"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            <option v-for="h in 24" :key="h" :value="h" class="bg-gray-900">
              {{ h.toString().padStart(2, "0") }}:00
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Date/Time Format -->
    <div class="glass-card p-6">
      <h3 class="font-semibold mb-6 text-white">Formato de Data e Hora</h3>

      <div class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300"
            >Formato de Data</label
          >
          <select
            :value="settings.dateFormat"
            @change="update('dateFormat', $event.target.value)"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            <option value="DD/MM/YYYY" class="bg-gray-900">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY" class="bg-gray-900">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD" class="bg-gray-900">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300"
            >Formato de Hora</label
          >
          <select
            :value="settings.timeFormat"
            @change="update('timeFormat', $event.target.value)"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            <option value="24h" class="bg-gray-900">24 horas (14:00)</option>
            <option value="12h" class="bg-gray-900">12 horas (2:00 PM)</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
