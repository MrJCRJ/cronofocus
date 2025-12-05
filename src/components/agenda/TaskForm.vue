<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const props = defineProps({
  editing: {
    type: Object,
    default: null,
  },
  initialSlot: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["saved", "cancel"]);

const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

const loading = ref(false);
const error = ref("");

// Form state
const form = ref({
  title: "",
  category: "work",
  plannedStart: "",
  plannedEnd: "",
  description: "",
  priority: "medium",
  notes: "",
});

// Categories
const categories = computed(() => timeStore.categories);
const timeSlots = computed(() => settingsStore.timeSlots);

// Priority options
const priorities = [
  { value: "low", label: "Baixa", color: "text-blue-400" },
  { value: "medium", label: "Média", color: "text-yellow-400" },
  { value: "high", label: "Alta", color: "text-red-400" },
];

// Duration calculation
const duration = computed(() => {
  if (!form.value.plannedStart || !form.value.plannedEnd) return null;
  return settingsStore.calculateDuration(
    form.value.plannedStart,
    form.value.plannedEnd
  );
});

const formattedDuration = computed(() => {
  if (!duration.value || duration.value <= 0) return "";
  return settingsStore.formatDuration(duration.value);
});

// Initialize form
onMounted(() => {
  if (props.editing) {
    // Edit mode
    form.value = {
      title: props.editing.title || "",
      category: props.editing.category || "work",
      plannedStart: props.editing.plannedStart || "",
      plannedEnd: props.editing.plannedEnd || "",
      description: props.editing.description || "",
      priority: props.editing.priority || "medium",
      notes: props.editing.notes || "",
    };
  } else if (props.initialSlot) {
    // New task from slot click
    form.value.plannedStart = props.initialSlot.time;

    // Calculate end time (default 30 min)
    const interval = settingsStore.settings.timeInterval;
    const [hours, mins] = props.initialSlot.time.split(":").map(Number);
    const endMinutes = hours * 60 + mins + interval;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    form.value.plannedEnd = `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  } else {
    // Default: next available slot
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const interval = settingsStore.settings.timeInterval;

    // Round up to next interval
    const nextSlotMinutes = Math.ceil(currentMinutes / interval) * interval;
    const startHours = Math.floor(nextSlotMinutes / 60);
    const startMins = nextSlotMinutes % 60;

    form.value.plannedStart = `${startHours
      .toString()
      .padStart(2, "0")}:${startMins.toString().padStart(2, "0")}`;
    form.value.plannedEnd = `${(
      startHours + Math.floor((startMins + interval) / 60)
    )
      .toString()
      .padStart(2, "0")}:${((startMins + interval) % 60)
      .toString()
      .padStart(2, "0")}`;
  }
});

// Watch start time to auto-adjust end time
watch(
  () => form.value.plannedStart,
  (newStart) => {
    if (!props.editing && newStart) {
      const interval = settingsStore.settings.timeInterval;
      const [hours, mins] = newStart.split(":").map(Number);
      const endMinutes = hours * 60 + mins + interval;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;

      // Only auto-adjust if end time would be invalid
      if (
        !form.value.plannedEnd ||
        settingsStore.calculateDuration(newStart, form.value.plannedEnd) <= 0
      ) {
        form.value.plannedEnd = `${endHours
          .toString()
          .padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
      }
    }
  }
);

// Validation
function validate() {
  error.value = "";

  if (!form.value.title.trim()) {
    error.value = "Título é obrigatório";
    return false;
  }

  if (!form.value.plannedStart || !form.value.plannedEnd) {
    error.value = "Horário inicial e final são obrigatórios";
    return false;
  }

  if (duration.value <= 0) {
    error.value = "Horário final deve ser após o inicial";
    return false;
  }

  // Check for overlapping tasks
  const existingTasks = timeStore.tasks.filter((t) =>
    props.editing ? t.id !== props.editing.id : true
  );

  const hasOverlap = existingTasks.some((task) => {
    const taskStart = task.plannedStart;
    const taskEnd = task.plannedEnd;
    const newStart = form.value.plannedStart;
    const newEnd = form.value.plannedEnd;

    return newStart < taskEnd && newEnd > taskStart;
  });

  if (hasOverlap) {
    error.value = "Este horário já está ocupado por outra tarefa";
    return false;
  }

  return true;
}

// Save task
async function save() {
  if (!validate()) return;

  try {
    loading.value = true;
    error.value = "";

    const taskData = {
      title: form.value.title.trim(),
      category: form.value.category,
      plannedStart: form.value.plannedStart,
      plannedEnd: form.value.plannedEnd,
      plannedDuration: duration.value,
      description: form.value.description.trim(),
      priority: form.value.priority,
      notes: form.value.notes.trim(),
    };

    if (props.editing) {
      await timeStore.updateTask(props.editing.id, taskData);
    } else {
      await timeStore.createTask(taskData);
    }

    emit("saved");
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Delete task
async function deleteTask() {
  if (!props.editing) return;

  if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

  try {
    loading.value = true;
    await timeStore.deleteTask(props.editing.id);
    emit("saved");
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Quick duration buttons
function setDuration(minutes) {
  if (!form.value.plannedStart) return;

  const [hours, mins] = form.value.plannedStart.split(":").map(Number);
  const endMinutes = hours * 60 + mins + minutes;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  form.value.plannedEnd = `${endHours.toString().padStart(2, "0")}:${endMins
    .toString()
    .padStart(2, "0")}`;
}
</script>

<template>
  <div class="glass-card overflow-hidden">
    <!-- Header -->
    <div class="p-5 border-b border-white/10 flex items-center justify-between">
      <h2 class="text-lg font-bold text-white">
        {{ editing ? "✏️ Editar Tarefa" : "➕ Nova Tarefa" }}
      </h2>
      <button
        @click="emit('cancel')"
        class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="save" class="p-5 space-y-5">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">
          Título <span class="text-red-400">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          placeholder="O que você vai fazer?"
          autofocus
        />
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium mb-3 text-gray-300"
          >Categoria</label
        >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            @click="form.category = cat.id"
            :class="[
              'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2',
              form.category === cat.id
                ? 'ring-2 ring-offset-2 ring-offset-gray-900 scale-105 shadow-lg'
                : 'opacity-60 hover:opacity-100 hover:scale-105',
            ]"
            :style="{
              backgroundColor: cat.color + '25',
              color: cat.color,
              '--tw-ring-color': cat.color,
              boxShadow:
                form.category === cat.id ? `0 8px 30px ${cat.color}30` : '',
            }"
          >
            <span class="text-lg">{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- Time -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300"
            >Início</label
          >
          <select
            v-model="form.plannedStart"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            <option value="" class="bg-gray-900">Selecione</option>
            <option
              v-for="slot in timeSlots"
              :key="slot.time"
              :value="slot.time"
              class="bg-gray-900"
            >
              {{ slot.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300"
            >Fim</label
          >
          <select
            v-model="form.plannedEnd"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            <option value="" class="bg-gray-900">Selecione</option>
            <option
              v-for="slot in timeSlots"
              :key="slot.time"
              :value="slot.time"
              :disabled="slot.time <= form.plannedStart"
              class="bg-gray-900"
            >
              {{ slot.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Quick Duration Buttons -->
      <div>
        <label class="block text-sm font-medium mb-3 text-gray-300"
          >Duração Rápida</label
        >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="mins in [15, 30, 45, 60, 90, 120]"
            :key="mins"
            type="button"
            @click="setDuration(mins)"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              duration === mins
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white/5 text-gray-300 hover:bg-white/10',
            ]"
          >
            {{ mins < 60 ? `${mins}min` : `${mins / 60}h` }}
          </button>
        </div>

        <p
          v-if="formattedDuration"
          class="text-sm text-primary mt-3 font-medium"
        >
          ⏱️ Duração: {{ formattedDuration }}
        </p>
      </div>

      <!-- Priority -->
      <div>
        <label class="block text-sm font-medium mb-3 text-gray-300"
          >Prioridade</label
        >
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="p in priorities"
            :key="p.value"
            type="button"
            @click="form.priority = p.value"
            :class="[
              'py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              form.priority === p.value
                ? 'ring-2 ring-offset-2 ring-offset-gray-900 shadow-lg'
                : 'bg-white/5 hover:bg-white/10',
              p.color,
            ]"
            :style="{
              backgroundColor:
                form.priority === p.value
                  ? p.value === 'low'
                    ? '#3b82f620'
                    : p.value === 'medium'
                    ? '#eab30820'
                    : '#ef444420'
                  : '',
              '--tw-ring-color':
                p.value === 'low'
                  ? '#3b82f6'
                  : p.value === 'medium'
                  ? '#eab308'
                  : '#ef4444',
            }"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300"
          >Descrição</label
        >
        <textarea
          v-model="form.description"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          rows="2"
          placeholder="Detalhes da tarefa (opcional)"
        />
      </div>

      <!-- Error -->
      <p
        v-if="error"
        class="text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20"
      >
        {{ error }}
      </p>

      <!-- Actions -->
      <div class="flex gap-3 pt-4">
        <button
          v-if="editing"
          type="button"
          @click="deleteTask"
          class="btn-premium btn-danger px-5 py-3"
          :disabled="loading"
        >
          🗑️ Excluir
        </button>

        <div class="flex-1" />

        <button
          type="button"
          @click="emit('cancel')"
          class="btn-premium btn-glass px-5 py-3"
          :disabled="loading"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="btn-premium btn-primary px-6 py-3"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin mr-2">⏳</span>
          <span v-else>{{ editing ? "💾 Salvar" : "✨ Criar Tarefa" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
