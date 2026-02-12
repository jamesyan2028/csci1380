const distribution = require('../../distribution')();
const id = distribution.util.id;

const remote = { 
  node: { ip: '127.0.0.1', port: 1234 }, 
  service: 'status', 
  method: 'get' 
};
const message = ['nid'];
const iterations = 1000;

function characterizeComm() {
  let completed = 0;
  const startTime = process.hrtime.bigint();
  const latencies = [];

  for (let i = 0; i < iterations; i++) {
    const requestStart = process.hrtime.bigint();

    distribution.local.comm.send(message, remote, (err, value) => {
      const requestEnd = process.hrtime.bigint();
      latencies.push(requestEnd - requestStart);
      completed++;

      if (completed === iterations) {
        const endTime = process.hrtime.bigint();
        const totalDurationNs = endTime - startTime;
        
        const totalDurationMs = Number(totalDurationNs) / 1_000_000;
        const avgLatencyMs = Number(latencies.reduce((a, b) => a + b, 0n) / BigInt(iterations)) / 1_000_000;
        const throughput = iterations / (totalDurationMs / 1000);

        console.log(`Avg Latency: ${avgLatencyMs.toFixed(2)} ms`);
        console.log(`Throughput: ${throughput.toFixed(2)} ops/sec`);
      }
    });
  }
}

distribution.node.start((err) => {
  if (err) throw err;
  
  characterizeComm();
  distribution.node.server.close();

});