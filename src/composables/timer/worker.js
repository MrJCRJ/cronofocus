/**
 * CronoFocus - Timer Worker Module
 * Código do Web Worker inline para timer em segundo plano
 */

/**
 * Código do Web Worker (inline)
 */
export const workerCode = `
let timerInterval = null;
let remainingTime = 0;
let isRunning = false;

self.onmessage = function(e) {
  const { command, time } = e.data;
  
  switch(command) {
    case 'start':
      remainingTime = time;
      isRunning = true;
      startTimer();
      break;
      
    case 'pause':
      isRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      self.postMessage({ type: 'paused', time: remainingTime });
      break;
      
    case 'resume':
      isRunning = true;
      startTimer();
      break;
      
    case 'reset':
      isRunning = false;
      remainingTime = time;
      if (timerInterval) clearInterval(timerInterval);
      self.postMessage({ type: 'reset', time: remainingTime });
      break;
      
    case 'stop':
      isRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      self.postMessage({ type: 'stopped', time: remainingTime });
      break;
      
    case 'add':
      remainingTime += time;
      self.postMessage({ type: 'update', time: remainingTime });
      break;
  }
};

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (!isRunning) return;
    
    remainingTime--;
    
    self.postMessage({ 
      type: 'update', 
      time: remainingTime 
    });
    
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      self.postMessage({ type: 'finished' });
    }
    
    // Notificar a cada minuto
    if (remainingTime > 0 && remainingTime % 60 === 0) {
      self.postMessage({ 
        type: 'minute', 
        minutes: remainingTime / 60 
      });
    }
    
    // Avisos de tempo
    if (remainingTime === 300) { // 5 minutos
      self.postMessage({ type: 'warning', minutes: 5 });
    } else if (remainingTime === 60) { // 1 minuto
      self.postMessage({ type: 'warning', minutes: 1 });
    }
  }, 1000);
}
`;

// Worker singleton
let timerWorker = null

/**
 * Cria o Web Worker
 */
export function createWorker(messageHandler, errorHandler) {
  if (timerWorker) {
    timerWorker.terminate()
  }

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(blob)
  timerWorker = new Worker(workerUrl)

  timerWorker.onmessage = messageHandler
  timerWorker.onerror = errorHandler || ((error) => {
    console.error('Timer Worker Error:', error)
  })

  URL.revokeObjectURL(workerUrl)

  return timerWorker
}

/**
 * Obtém o worker atual ou cria um novo
 */
export function getWorker() {
  return timerWorker
}

/**
 * Envia comando para o worker
 */
export function postCommand(command, time = null) {
  if (timerWorker) {
    timerWorker.postMessage({ command, time })
  }
}
