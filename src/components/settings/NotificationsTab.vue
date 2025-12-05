<script setup>
/**
 * NotificationsTab - Aba de configurações de notificações
 */
const props = defineProps({
  settings: { type: Object, required: true },
});

const emit = defineEmits(["updateSetting", "requestNotifications"]);

function update(key, value) {
  emit("updateSetting", key, value);
}

function toggleNotifications() {
  if (props.settings.notificationsEnabled) {
    update("notificationsEnabled", false);
  } else {
    emit("requestNotifications");
  }
}
</script>

<template>
  <div class="space-y-6">
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
              @change="toggleNotifications"
              class="sr-only peer"
            />
            <div
              class="w-12 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
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
              @change="update('soundEnabled', !settings.soundEnabled)"
              class="sr-only peer"
            />
            <div
              class="w-12 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
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
            @change="update('soundVolume', Number($event.target.value))"
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
            @change="update('reminderMinutes', Number($event.target.value))"
            class="w-full bg-white/5 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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
</template>
