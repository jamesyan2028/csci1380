// measure.js
require('../../distribution.js')();
const distribution = globalThis.distribution;

distribution.node.start(() => {
  const ports = [8001, 8002, 8003, 8004, 8005];
  const latencies = [];
  
  function spawnNext(i) {
    if (i >= ports.length) {
      // Done — report results
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const throughput = 1000 / avg; // nodes per second
      console.log(`Latencies: ${latencies.map(l => l + 'ms').join(', ')}`);
      console.log(`Average latency: ${avg.toFixed(1)}ms`);
      console.log(`Throughput: ${throughput.toFixed(2)} nodes/sec`);
      process.exit(0);
      return;
    }

    const start = Date.now();
    distribution.local.status.spawn({ip: '127.0.0.1', port: ports[i]}, (e, v) => {
      const latency = Date.now() - start;
      latencies.push(latency);
      console.log(`Node ${ports[i]} booted in ${latency}ms`);
      spawnNext(i + 1);
    });
  }

  spawnNext(0);
});
