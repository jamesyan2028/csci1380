//benchmark mapreduce with word frequency
require('../../distribution.js')();
const distribution = globalThis.distribution;
const id = distribution.util.id;
const fs = require('fs');
const path = require('path');

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

const mapper = (key, value) => {
  const words = value.split(/\s+/).filter((w) => w.length > 0);
  return words.map((word) => ({[word]: 1}));
};

const reducer = (key, values) => {
  return {[key]: values.reduce((a, b) => a + b, 0)};
};

function generateDataset(numDocs, wordsPerDoc) {
  const wordPool = ['the', 'quick', 'brown', 'fox', 'jumps', 'over',
    'lazy', 'dog', 'hello', 'world', 'distributed', 'systems',
    'mapreduce', 'shuffle', 'reduce', 'map', 'node', 'cluster'];
  const dataset = {};
  for (let i = 0; i < numDocs; i++) {
    const words = [];
    for (let j = 0; j < wordsPerDoc; j++) {
      words.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
    }
    dataset[`doc${i}`] = words.join(' ');
  }
  return dataset;
}

function measureMapReduce(dataset, groupName, callback) {
  const keys = Object.keys(dataset);

  const insertStart = Date.now();
  let inserted = 0;

  keys.forEach((key) => {
    distribution[groupName].store.put(dataset[key], key, (e) => {
      inserted++;
      if (inserted === keys.length) {
        const insertLatency = Date.now() - insertStart;
        const insertThroughput = (keys.length / insertLatency) * 1000;
        console.log(`\n--- Insert Phase ---`);
        console.log(`Documents: ${keys.length}`);
        console.log(`Total time: ${insertLatency}ms`);
        console.log(`Throughput: ${insertThroughput.toFixed(2)} docs/sec`);
        console.log(`Avg latency: ${(insertLatency / keys.length).toFixed(2)}ms/doc`);

        distribution[groupName].store.get(null, (e, storedKeys) => {
          const mrStart = Date.now();

          distribution[groupName].mr.exec(
            {keys: storedKeys, map: mapper, reduce: reducer},
            (e, results) => {
              if (e) {
                console.error('MapReduce error:', e);
                return callback(e);
              }

              const mrLatency = Date.now() - mrStart;
              const mrThroughput = (keys.length / mrLatency) * 1000;

              console.log(`\n--- MapReduce Phase ---`);
              console.log(`Documents processed: ${keys.length}`);
              console.log(`Unique words found: ${results.length}`);
              console.log(`Total time: ${mrLatency}ms`);
              console.log(`Throughput: ${mrThroughput.toFixed(2)} docs/sec`);
              console.log(`Avg latency: ${(mrLatency / keys.length).toFixed(2)}ms/doc`);

              callback(null, {insertLatency, insertThroughput, mrLatency, mrThroughput});
            }
          );
        });
      }
    });
  });
}

function runBenchmark() {
  const perfGroup = {};
  perfGroup[id.getSID(n1)] = n1;
  perfGroup[id.getSID(n2)] = n2;
  perfGroup[id.getSID(n3)] = n3;

  const sizes = [10, 50, 100];

  distribution.node.start((e) => {
    distribution.local.status.spawn(n1, () => {
      distribution.local.status.spawn(n2, () => {
        distribution.local.status.spawn(n3, () => {
          const perfConfig = {gid: 'perf'};
          distribution.local.groups.put(perfConfig, perfGroup, () => {
            distribution.perf.groups.put(perfConfig, perfGroup, () => {

              let sizeIndex = 0;

              function runNext() {
                if (sizeIndex >= sizes.length) {
                  console.log('\n--- Benchmark Complete ---');
                  // Cleanup
                  const STORE_DIR = path.resolve(__dirname, './store');
                  fs.rmSync(STORE_DIR, {recursive: true, force: true});
                  const remote = {service: 'status', method: 'stop'};
                  remote.node = n1;
                  distribution.local.comm.send([], remote, () => {
                    remote.node = n2;
                    distribution.local.comm.send([], remote, () => {
                      remote.node = n3;
                      distribution.local.comm.send([], remote, () => {
                        if (globalThis.distribution.node.server) {
                          globalThis.distribution.node.server.close();
                        }
                        process.exit(0);
                      });
                    });
                  });
                  return;
                }

                const numDocs = sizes[sizeIndex];
                console.log(`\n=============================`);
                console.log(`Dataset size: ${numDocs} documents, 20 words each`);
                console.log(`=============================`);

                const dataset = generateDataset(numDocs, 20);

                // Clean store between runs
                const STORE_DIR = path.resolve(__dirname, './store');
                fs.rmSync(STORE_DIR, {recursive: true, force: true});

                measureMapReduce(dataset, 'perf', (e, results) => {
                  sizeIndex++;
                  setTimeout(runNext, 500);
                });
              }

              runNext();
            });
          });
        });
      });
    });
  });
}

runBenchmark();