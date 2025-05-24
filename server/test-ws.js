import WebSocket from 'ws';

const TOTAL_CLIENTS = 5000;
const URL = 'ws://147.93.81.243/api/';
const RECONNECT_DELAY_MS = 100;
const INACTIVITY_TIMEOUT_MS = 60000;
const TEST_DURATION_MS = 1800000;

const CLIENTS_PER_BATCH = 100;
const BATCH_INTERVAL_MS = 100;

let totalEvents = 0;
let firstLatencies = [];
let firstResponseTimes = [];
let startTimes = Array(TOTAL_CLIENTS).fill(0);
let messageCounts = Array(TOTAL_CLIENTS).fill(0);
let totalConnectionErrors = 0;
let initialConnectionsAttempted = 0;

const testStartTime = Date.now();

console.log(`🚀 Starting ${TOTAL_CLIENTS} WebSocket clients in batches...`);

function calculatePercentile(arr, p) {
  if (arr.length === 0) return 0;
  const sortedArr = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sortedArr.length - 1);
  if (index % 1 === 0) {
    return sortedArr[index];
  } else {
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
  }
}

function createWSClient(clientId) {
  initialConnectionsAttempted++;
  const ws = new WebSocket(URL);
  let inactivityTimer;

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      console.warn(`[Client ${clientId}] ❌ No message received in ${INACTIVITY_TIMEOUT_MS / 1000}s, closing WebSocket connection.`);
      ws.close()
    }, INACTIVITY_TIMEOUT_MS);
  };

  ws.onopen = () => {
    startTimes[clientId] = Date.now();
    messageCounts[clientId] = 0;
    resetInactivityTimer();
  };

  ws.onmessage = (event) => {
    resetInactivityTimer();
    try {
      const now = Date.now();
      const data = JSON.parse(event.data);
      const sent = new Date(data.sent_at).getTime();
      const latency = now - sent;

      messageCounts[clientId]++;
      totalEvents++;

      if (messageCounts[clientId] === 1) {
        const responseTime = now - startTimes[clientId];
        firstLatencies.push(latency);
        firstResponseTimes.push(responseTime);
      }
    } catch (err) {
      console.error(`⚠️ JSON error (client ${clientId}):`, err.message);
    }
  };

  ws.onerror = (err) => {
    totalConnectionErrors++;
    ws.close();
    clearTimeout(inactivityTimer);

    setTimeout(() => createWSClient(clientId), RECONNECT_DELAY_MS);
  };

  ws.onclose = (event) => {
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
    console.log(`✅ All ${TOTAL_CLIENTS} clients initiated in batches.`);
  }
};

openClientsInBatch();

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
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length || 0;

  const p90ResponseTime = calculatePercentile(firstResponseTimes, 90);
  const p95ResponseTime = calculatePercentile(firstResponseTimes, 95);

  const totalConnectionAttempts = initialConnectionsAttempted + totalConnectionErrors;
  const errorRate = (totalConnectionErrors / totalConnectionAttempts) * 100;

  console.log('\n📊 === SUMMARY ===');
  console.log(`👥 Clients         : ${TOTAL_CLIENTS}`);
  console.log(`⏱️ Test Duration   : ${TEST_DURATION_MS / 60000} minutes`);
  console.log(`📨 Total Events    : ${totalEvents}`);
  console.log(`⏱️ Avg Latency     : ${avg(firstLatencies).toFixed(2)} ms`);
  console.log(`⏱️ Avg Response    : ${avg(firstResponseTimes).toFixed(2)} ms`);
  console.log(`⏱️ P90 Response    : ${p90ResponseTime.toFixed(2)} ms`);
  console.log(`⏱️ P95 Response    : ${p95ResponseTime.toFixed(2)} ms`);
  console.log(`⚡ Throughput       : ${(totalEvents / (TEST_DURATION_MS / 1000)).toFixed(2)} msg/sec`);
  console.log(`❌ Total Errors     : ${totalConnectionErrors}`);
  console.log(`🔄 Total Connection Attempts: ${totalConnectionAttempts}`);
  console.log(`📈 Error Rate       : ${errorRate.toFixed(2)} %`);
  process.exit(0);
}, TEST_DURATION_MS);