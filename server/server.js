import cluster from 'cluster'
import os from 'os'

const numCPUs = os.cpus().length

if (cluster.isPrimary) {
  console.log(`🚀 Master ${process.pid} is running`)
  console.log(`🧠 Spawning ${numCPUs} workers...`)
  
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork()
    console.log(`🔧 Worker ${worker.process.pid} started`)
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`❌ Worker ${worker.process.pid} exited. Restarting...`)
    const newWorker = cluster.fork()
    console.log(`🔁 Worker ${newWorker.process.pid} restarted`)
  })
} else {
  import('./index.js')
}
