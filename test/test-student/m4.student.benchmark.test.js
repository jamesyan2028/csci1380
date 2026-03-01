const distribution = require('../../distribution.js')();

const n1 = {ip: '127.0.0.1', port: 9001};
const n2 = {ip: '127.0.0.1', port: 9002};
const n3 = {ip: '127.0.0.1', port: 9003};
const nodes = [n1, n2, n3];

const GID = 'benchmark';
const COUNT = 1000;

function randomString(len = 8) {
  return Math.random().toString(36).substring(2, 2 + len);
}

function randomObject() {
  return {
    id:    randomString(8),
    name:  randomString(12),
    value: Math.floor(Math.random() * 100000),
    tag:   randomString(4),
  };
}

function benchPut(store, pairs, callback) {
  const latencies = [];
  let i = 0;

  const next = () => {
    if (i >= pairs.length) {
      return callback(null, latencies);
    }
    const { key, val } = pairs[i++];
    const start = Date.now();
    store.put(val, key, (e) => {
      if (e) return cb(e);
      latencies.push(Date.now() - start);
      next();
    });
  };

  next();
}

function benchGet(store, pairs, cb) {
  const latencies = [];
  let i = 0;

  const next = () => {
    if (i >= pairs.length) {
      return cb(null, latencies);
    }
    const { key } = pairs[i++];
    const start = Date.now();
    store.get(key, (e) => {
      if (e) return cb(e);
      latencies.push(Date.now() - start);
      next();
    });
  };

  next();
}

function printStats(label, latencies) {
  const total   = latencies.reduce((a, b) => a + b, 0);
  const avg     = total / latencies.length;
  const sorted  = [...latencies].sort((a, b) => a - b);
  const throughput = (latencies.length / (total / 1000)).toFixed(2);

  console.log(`\n─── ${label} ───`);
  console.log(`  Operations : ${latencies.length}`);
  console.log(`  Total time : ${total} ms`);
  console.log(`  Throughput : ${throughput} ops/sec`);
  console.log(`  Avg latency: ${avg.toFixed(2)} ms`);
  console.log(`  p50 latency: ${p50} ms`);
  console.log(`  p95 latency: ${p95} ms`);
  console.log(`  p99 latency: ${p99} ms`);
}

distribution.node.start(() => {
  let spawned = 0;
  nodes.forEach((node) => {
    distribution.local.status.spawn(node, (e) => {
      if (e) {
        console.error('Failed to spawn node:', e);
        process.exit(1);
      }
      if (++spawned < nodes.length) return;

      const group = {};
      nodes.forEach((n) => {
        group[distribution.util.id.getSID(n)] = n;
      });

      distribution.local.groups.put(
        { gid: GID, hash: distribution.util.id.rendezvousHash },
        group,
        (e) => {
          if (e) {
            console.error('Failed to create group:', e);
            process.exit(1);
          }

          const pairs = Array.from({ length: COUNT }, () => ({
            key: randomString(16),
            val: randomObject(),
          }));

          const store = distribution[GID].store;

          console.log(`\nStage 2: Inserting ${COUNT} objects...`);
          const putWallStart = Date.now();

          benchPut(store, pairs, (e, putLatencies) => {
            if (e) {
              console.error('Put error:', e);
              process.exit(1);
            }

            const putWallMs = Date.now() - putWallStart;
            printStats('INSERT', putLatencies);
            console.log(`  Wall time  : ${putWallMs} ms`);

            const getWallStart = Date.now();

            benchGet(store, pairs, (e, getLatencies) => {
              if (e) {
                console.error('Get error:', e);
                process.exit(1);
              }

              const getWallMs = Date.now() - getWallStart;
              printStats('RETRIEVE', getLatencies);
              console.log(`  Wall time  : ${getWallMs} ms`);

              // shut nodes down
              const remote = { service: 'status', method: 'stop' };
              let stopped = 0;
              nodes.forEach((node) => {
                remote.node = node;
                distribution.local.comm.send([], remote, () => {
                  if (++stopped === nodes.length) {
                    if (globalThis.distribution.node.server) {
                      globalThis.distribution.node.server.close();
                    }
                    process.exit(0);
                  }
                });
              });
            });
          });
        }
      );
    });
  });
});