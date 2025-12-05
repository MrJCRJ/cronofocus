<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useTimeStore } from "@/stores/timeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const emit = defineEmits(["slot-click", "task-click", "task-start"]);

const timeStore = useTimeStore();
const settingsStore = useSettingsStore();

const containerRef = ref(null);
const currentTimePosition = ref(0);
const isDragging = ref(false);
const draggedTask = ref(null);
const dropTarget = ref(null);

// Time slots configuration
const timeSlots = computed(() => settingsStore.timeSlots);

// Current time line position
const updateCurrentTime = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const startHour = settingsStore.settings.dayStartHour;
  const totalMinutes = (currentHour - startHour) * 60 + currentMinute;
  const slotHeight = 60; // 60px per hour

  currentTimePosition.value = (totalMinutes / 60) * slotHeight;
};

// Update every minute
let timeInterval = null;
onMounted(() => {
  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 60000);

  // Scroll to current time
  setTimeout(() => {
    scrollToCurrentTime();
  }, 100);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});

function scrollToCurrentTime() {
  if (containerRef.value) {
    const scrollPosition = Math.max(0, currentTimePosition.value - 200);
    containerRef.value.scrollTop = scrollPosition;
  }
}

// Tasks positioning
function getTaskStyle(task) {
  const startParts = task.plannedStart.split(":");
  const endParts = task.plannedEnd.split(":");

  const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  const dayStartMinutes = settingsStore.settings.dayStartHour * 60;

  const top = ((startMinutes - dayStartMinutes) / 60) * 60; // 60px per hour
  const height = Math.max(((endMinutes - startMinutes) / 60) * 60, 30); // Min 30px

  return {
    top: `${top}px`,
    height: `${height}px`,
  };
}

function getTaskCategory(task) {
  return (
    timeStore.categories.find((c) => c.id === task.category) || {
      color: "#6b7280",
      name: "Outros",
      icon: "📌",
    }
  );
}

function getStatusColor(status) {
  const colors = {
    planned: "bg-gray-500/20 border-gray-500/50",
    "in-progress": "bg-amber-500/20 border-amber-500/50 animate-pulse-soft",
    completed: "bg-green-500/20 border-green-500/50",
    skipped: "bg-red-500/20 border-red-500/50",
    paused: "bg-purple-500/20 border-purple-500/50",
  };
  return colors[status] || colors.planned;
}

function getProgressWidth(task) {
  if (task.status === "completed") return 100;
  if (!task.actualDuration || !task.plannedDuration) return 0;
  return Math.min(100, (task.actualDuration / task.plannedDuration) * 100);
}

// Drag and Drop
function onDragStart(event, task) {
  isDragging.value = true;
  draggedTask.value = task;
  event.dataTransfer.effectAllowed = "move";
  event.target.classList.add("dragging");
}

function onDragEnd(event) {
  isDragging.value = false;
  draggedTask.value = null;
  dropTarget.value = null;
  event.target.classList.remove("dragging");
}

function onDragOver(event, slot) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  dropTarget.value = slot.time;
}

function onDragLeave() {
  dropTarget.value = null;
}

async function onDrop(event, slot) {
  event.preventDefault();
  dropTarget.value = null;

  if (draggedTask.value) {
    const duration = settingsStore.calculateDuration(
      draggedTask.value.plannedStart,
      draggedTask.value.plannedEnd
    );

    // Calculate new end time
    const [hours, mins] = slot.time.split(":").map(Number);
    const endMinutes = hours * 60 + mins + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const newEndTime = `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;

    await timeStore.moveTask(draggedTask.value.id, slot.time, newEndTime);
  }
}

// Click handlers
function handleSlotClick(slot) {
  emit("slot-click", slot);
}

function handleTaskClick(task) {
  emit("task-click", task);
}

function handleStartTask(event, task) {
  event.stopPropagation();
  emit("task-start", task);
}

// Check if slot is in the past
function isSlotPast(slot) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [hours, mins] = slot.time.split(":").map(Number);
  const slotMinutes = hours * 60 + mins;

  const today = new Date().toISOString().split("T")[0];
  return timeStore.selectedDate === today && slotMinutes < currentMinutes;
}

// Check if it's current hour
function isCurrentHour(hour) {
  const now = new Date();
  const today = new Date().toISOString().split("T")[0];
  return timeStore.selectedDate === today && hour === now.getHours();
}

// Group slots by hour
const hourlySlots = computed(() => {
  const grouped = {};
  timeSlots.value.forEach((slot) => {
    if (!grouped[slot.hour]) {
      grouped[slot.hour] = [];
    }
    grouped[slot.hour].push(slot);
  });
  return grouped;
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative h-[600px] overflow-y-auto overflow-x-hidden custom-scrollbar"
    id="agenda-timeline"
  >
    <!-- Timeline Grid -->
    <div class="relative min-h-full" style="padding-right: 12px">
      <!-- Hours Column -->
      <div class="timeline-grid">
        <!-- Time Labels Column -->
        <div class="sticky left-0 z-10 bg-gray-900/95 backdrop-blur-sm">
          <div
            v-for="hour in Object.keys(hourlySlots).map(Number)"
            :key="hour"
            class="h-[60px] flex items-start justify-end pr-3 pt-1"
          >
            <span
              :class="[
                'text-xs font-semibold',
                isCurrentHour(hour)
                  ? 'text-primary drop-shadow-glow'
                  : 'text-gray-500',
              ]"
            >
              {{ hour.toString().padStart(2, "0") }}:00
            </span>
          </div>
        </div>

        <!-- Slots Column -->
        <div class="relative">
          <!-- Grid Lines -->
          <div
            v-for="hour in Object.keys(hourlySlots).map(Number)"
            :key="`hour-${hour}`"
            class="h-[60px] border-b border-white/5"
          >
            <!-- Half hour line -->
            <div class="h-[30px] border-b border-dashed border-white/5" />
          </div>

          <!-- Drop Zones (Click Areas) -->
          <div class="absolute inset-0">
            <div
              v-for="slot in timeSlots"
              :key="slot.time"
              @click="handleSlotClick(slot)"
              @dragover="onDragOver($event, slot)"
              @dragleave="onDragLeave"
              @drop="onDrop($event, slot)"
              :class="[
                'h-[30px] cursor-pointer transition-all duration-200',
                isSlotPast(slot) ? 'bg-white/5' : 'hover:bg-primary/10',
                dropTarget === slot.time
                  ? 'bg-primary/20 border-2 border-dashed border-primary shadow-inner'
                  : '',
              ]"
            />
          </div>

          <!-- Tasks Layer -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="task in timeStore.sortedTasks"
              :key="task.id"
              :draggable="task.status === 'planned'"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
              @click.stop="handleTaskClick(task)"
              :class="[
                'task-block absolute left-1 right-1 pointer-events-auto cursor-pointer',
                'border-l-4 transition-all duration-300',
                getStatusColor(task.status),
                isDragging && draggedTask?.id === task.id
                  ? 'opacity-50 scale-95'
                  : '',
              ]"
              :style="{
                ...getTaskStyle(task),
                borderLeftColor: getTaskCategory(task).color,
                backgroundColor: getTaskCategory(task).color + '15',
                boxShadow:
                  task.status === 'in-progress'
                    ? `0 0 20px ${getTaskCategory(task).color}30`
                    : '',
              }"
            >
              <!-- Task Content -->
              <div class="flex flex-col h-full overflow-hidden">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-sm truncate text-white">
                      {{ getTaskCategory(task).icon }} {{ task.title }}
                    </h4>
                    <p class="text-xs text-gray-400">
                      {{ task.plannedStart }} - {{ task.plannedEnd }}
                      <span
                        v-if="task.actualDuration"
                        class="ml-2 text-emerald-400 font-medium"
                      >
                        ({{ task.actualDuration }}min)
                      </span>
                    </p>
                  </div>

                  <!-- Quick Actions -->
                  <div class="flex gap-1" v-if="task.status === 'planned'">
                    <button
                      @click.stop="handleStartTask($event, task)"
                      class="w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      title="Iniciar"
                    >
                      ▶️
                    </button>
                  </div>
                  <div
                    v-else-if="task.status === 'completed'"
                    class="text-emerald-400 text-lg"
                  >
                    ✅
                  </div>
                  <div
                    v-else-if="task.status === 'in-progress'"
                    class="text-amber-400 text-lg animate-pulse"
                  >
                    ⏱️
                  </div>
                </div>

                <!-- Progress Bar -->
                <div v-if="task.status !== 'planned'" class="mt-auto">
                  <div
                    class="h-1.5 bg-gray-800/50 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full transition-all duration-500 rounded-full"
                      :class="
                        task.status === 'completed'
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                          : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      "
                      :style="{ width: `${getProgressWidth(task)}%` }"
                    />
                  </div>
                </div>

                <!-- Distractions Badge -->
                <div
                  v-if="task.distractions?.length > 0"
                  class="absolute top-1 right-1 px-2 py-0.5 bg-red-500/80 text-white text-xs rounded-full font-bold shadow-lg"
                >
                  {{ task.distractions.length }}
                </div>
              </div>
            </div>
          </div>

          <!-- Current Time Line -->
          <div
            v-if="
              timeStore.selectedDate === new Date().toISOString().split('T')[0]
            "
            class="current-time-line absolute left-0 right-0 z-30 pointer-events-none"
            :style="{ top: `${currentTimePosition}px` }"
          >
            <div
              class="absolute -left-2 -top-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold shadow-lg"
            >
              {{
                new Date().toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="timeStore.tasks.length === 0 && !timeStore.loading"
      class="absolute inset-0 flex items-center justify-center bg-gray-900/50"
    >
      <div class="text-center p-8 glass-card animate-fade-in">
        <div class="text-7xl mb-4">📅</div>
        <h3 class="text-xl font-bold mb-2 text-white">Nenhuma tarefa ainda</h3>
        <p class="text-gray-400 mb-4">
          Clique em qualquer horário para adicionar uma tarefa
        </p>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="timeStore.loading"
      class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.task-block {
  border-radius: 8px;
  padding: 8px;
  min-height: 28px;
}

.task-block:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.task-block.dragging {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.timeline-grid {
  display: grid;
  grid-template-columns: 50px 1fr;
}

@media (min-width: 768px) {
  .timeline-grid {
    grid-template-columns: 60px 1fr;
  }
}
</style>
