import WebSocket from 'ws';

const TOTAL_CLIENTS = 100;
const URL = 'ws://145.79.12.40/api/';
const RECONNECT_DELAY_MS = 100;
const INACTIVITY_TIMEOUT_MS = 180000;
const TEST_DURATION_MS = 900000;

const CLIENTS_PER_BATCH = 50;
const BATCH_INTERVAL_MS = 100;

let totalEvents = 0;
let startTimes = Array(TOTAL_CLIENTS).fill(0);
let messageCounts = Array(TOTAL_CLIENTS).fill(0);

const testStartTime = Date.now();

console.log(`🚀 Starting Testing ${TOTAL_CLIENTS} WebSocket`);

function createWSClient(clientId) {
  const ws = new WebSocket(URL);
  let inactivityTimer;

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      console.warn(`[Client ${clientId}] ❌ No message received in ${INACTIVITY_TIMEOUT_MS / 1000}s, closing WebSocket connection.`);
      ws.close();
    }, INACTIVITY_TIMEOUT_MS);
  };

  ws.onopen = () => {
    startTimes[clientId] = Date.now();
    messageCounts[clientId] = 0;
    resetInactivityTimer();
  };

  ws.onmessage = () => {
    resetInactivityTimer();
    messageCounts[clientId]++;
    totalEvents++;
  };

  ws.onerror = () => {
    ws.close();
    clearTimeout(inactivityTimer);
    setTimeout(() => createWSClient(clientId), RECONNECT_DELAY_MS);
  };
}

let clientsOpened = 0;
const openClientsInBatch = () => {
  for (let i = 0; i < CLIENTS_PER_BATCH && clientsOpened < TOTAL_CLIENTS; i++) {
    createWSClient(clientsOpened);
    clientsOpened++;
  }

  if (clientsOpened < TOTAL_CLIENTS) {
    setTimeout(openClientsInBatch, BATCH_INTERVAL_MS);
  } else {
    console.log(`✅ All ${TOTAL_CLIENTS} clients initiated.`);
  }
};

const progressInterval = setInterval(() => {
  const elapsedTimeMs = Date.now() - testStartTime;
  const progressPercentage = (elapsedTimeMs / TEST_DURATION_MS) * 100;

  const elapsedMinutes = Math.floor(elapsedTimeMs / 60000);
  const elapsedSeconds = Math.floor((elapsedTimeMs % 60000) / 1000);

  const totalMinutes = Math.floor(TEST_DURATION_MS / 60000);
  const totalSeconds = Math.floor((TEST_DURATION_MS % 60000) / 1000);

  const formatTime = (minutes, seconds) => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  console.log(`⏳ Test progress: ${formatTime(elapsedMinutes, elapsedSeconds)}/${formatTime(totalMinutes, totalSeconds)} - ${progressPercentage.toFixed(2)}% completed`);

  if (elapsedTimeMs >= TEST_DURATION_MS) {
    clearInterval(progressInterval);
  }
}, 10000);

setTimeout(() => {
  clearInterval(progressInterval);

  console.log('\n📊 === SUMMARY ===');
  console.log(`👥 Clients         : ${TOTAL_CLIENTS}`);
  console.log(`⏱️ Test Duration   : ${TEST_DURATION_MS / 60000} minutes`);
  console.log(`📨 Total Events    : ${totalEvents}`);
  console.log(`⚡ Throughput       : ${(totalEvents / (TEST_DURATION_MS / 1000)).toFixed(2)} msg/sec`);

  process.exit(0);
}, TEST_DURATION_MS);

(async () => {
  openClientsInBatch();
})();
