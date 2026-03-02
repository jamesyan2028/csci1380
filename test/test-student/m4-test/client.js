require('../../../distribution.js')();
const distribution = globalThis.distribution;
const id = distribution.util.id;

const n1 = {ip: '3.12.84.249', port: 8080};
const n2 = {ip: '3.145.106.173', port: 8080};
const n3 = {ip: '3.133.157.48', port: 8080};

const storeGroup = {};
storeGroup[id.getSID(n1)] = n1;
storeGroup[id.getSID(n2)] = n2;
storeGroup[id.getSID(n3)] = n3;

function randomString(len) {
  return Math.random().toString(36).substring(2, 2 + len);
}

function randomObject() {
  return {
    name: randomString(8),
    value: randomString(16),
    num: Math.floor(Math.random() * 10000),
  };
}

distribution.node.start((server) => {
  distribution.local.groups.put({gid: 'store'}, storeGroup, (e, v) => {
    if (e) { console.error('groups.put failed', e); process.exit(1); }

    const pairs = [];
    for (let i = 0; i < 1000; i++) {
      pairs.push({key: randomString(12), value: randomObject()});
    }

    const putLatencies = [];
    let i = 0;

    const putNext = () => {
      if (i >= pairs.length) return reportPut();
      const {key, value} = pairs[i++];
      const start = Date.now();
      distribution.store.mem.put(value, key, (e, v) => {
        if (e) console.error('put error', e);
        putLatencies.push(Date.now() - start);
        putNext();
      });
    };

    const reportPut = () => {
      const sorted = [...putLatencies].sort((a, b) => a - b);
      const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      console.log('=== PUT RESULTS ===');
      console.log(`  avg latency: ${avg.toFixed(1)} ms`);
      console.log(`  throughput:  ${(1000 / (sorted.reduce((a,b)=>a+b,0)/1000)).toFixed(1)} ops/sec\n`);
      getAll();
    };
    
    const getLatencies = [];
    let j = 0;

    const getAll = () => {
      const getNext = () => {
        if (j >= pairs.length) return reportGet();
        const {key} = pairs[j++];
        const start = Date.now();
        distribution.store.mem.get(key, (e, v) => {
          if (e) console.error('get error', e);
          getLatencies.push(Date.now() - start);
          getNext();
        });
      };
      getNext();
    };

    const reportGet = () => {
      const sorted = [...getLatencies].sort((a, b) => a - b);
      const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      console.log('=== GET RESULTS ===');
      console.log(`  avg latency: ${avg.toFixed(1)} ms`);
      console.log(`  throughput:  ${(1000 / (sorted.reduce((a,b)=>a+b,0)/1000)).toFixed(1)} ops/sec`);
      process.exit(0);
    };

    putNext();
  });
});