const distribution = require('../../distribution')();
const util = distribution.util;

const testCases = {
    t1: "abcd",
    t2: (a, b) => a + b,
    t3: {a: new Date(0), b: {nest: "testing"}, d: [1, 2, 3, 4]}
};

const ITERATIONS = 100;
const results = {};

for (const [name, obj] of Object.entries(testCases)) {
    const durations = [];

    for (let i = 0; i < ITERATIONS; i++) {
        const start = process.hrtime.bigint();

        const s = util.serialize(obj);
        util.deserialize(s);
        
        const end = process.hrtime.bigint();
        durations.push(end - start);
    }

    const totalNs = durations.reduce((acc, d) => acc + d, 0n);
    const avgNs = Number(totalNs) / ITERATIONS;
    const avgMs = avgNs / 1_000_000;

    results[name] = `${avgMs.toFixed(6)} ms`;
}

console.table(results);