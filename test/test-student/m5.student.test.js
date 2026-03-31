/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/
require('../helpers/sync-guard');

require('../../distribution.js')();
const distribution = globalThis.distribution;
const id = distribution.util.id;
const fs = require('fs');
const path = require('path');

const ncdcGroup = {};
const dlibGroup = {};
const tfidfGroup = {};
const crawlGroup = {};
const urlxtrGroup = {};
const strmatchGroup = {};
const strmatchGroup2 = {};
const ridxGroup = {};
const rlgGroup = {};

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {
    const words = value.split(/(\s+)/).filter((e) => e !== ' ');
    const out = {};
    out[words[1]] = parseInt(words[3]);
    return out;
  };

  const reducer = (key, values) => {
    const out = {};
    out[key] = values.reduce((a, b) => Math.max(a, b), -Infinity);
    return out;
  };

  const dataset = [
    {'000': '006701199099999 1950 0515070049999999N9 +0000 1+9999'},
    {'106': '004301199099999 1950 0515120049999999N9 +0022 1+9999'},
    {'212': '004301199099999 1950 0515180049999999N9 -0011 1+9999'},
    {'318': '004301265099999 1949 0324120040500001N9 +0111 1+9999'},
    {'424': '004301265099999 1949 0324180040500001N9 +0078 1+9999'},
    {'530': '004301265099999 1955 0324180040500001N9 +0042 1+9999'},
    {'636': '004301265099999 1960 0324180040500001N9 -0050 1+9999'},
    {'742': '004301265099999 1960 0324180040500001N9 -0020 1+9999'},
    {'848': '004301265099999 1960 0324180040500001N9 -0099 1+9999'},
    {'954': '004301265099999 1970 0324180040500001N9 +0000 1+9999'},
    {'060': '004301265099999 1970 0324180040500001N9 +0055 1+9999'},
    {'166': '004301265099999 1980 0324180040500001N9 +0100 1+9999'},
    {'272': '004301265099999 1980 0324180040500001N9 +0100 1+9999'},
    {'378': '004301265099999 1980 0324180040500001N9 +0050 1+9999'},
    {'484': '004301265099999 1990 0324180040500001N9 +0999 1+9999'},
  ];

  const expected = [
    {'1950': 22},
    {'1949': 111},
    {'1955': 42},
    {'1960': -20},
    {'1970': 55},
    {'1980': 100},
    {'1990': 999},
  ];

  const doMapReduce = () => {
    distribution.ncdc.store.get(null, (e, v) => {
      try {
        expect(v.length).toEqual(dataset.length);
      } catch (e) {
        done(e);
      }

      distribution.ncdc.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
        try {
          expect(v).toEqual(expect.arrayContaining(expected));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  };

  let cntr = 0;
  // Send the dataset to the cluster
  dataset.forEach((o) => {
    const key = Object.keys(o)[0];
    const value = o[key];
    distribution.ncdc.store.put(value, key, (e, v) => {
      cntr++;
      // Once the dataset is in place, run the map reduce
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
});


test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {
    const words = value.split(/\s+/).filter(word => word.length > 0);
    return words.map(word => ({ [word]: 1 }));
  };

  const reducer = (key, values) => {
    let out = {}
    out[key] = values.reduce((sum, curr) => sum + curr, 0)
    return out
  };

  const dataset = [
    {'b1-l1': 'It was the best of times, it was the worst of times,'},
    {'b1-l2': 'it was the age of wisdom, it was the age of foolishness,'},
    {'b1-l3': 'it was the epoch of belief, it was the epoch of incredulity,'},
    {'b1-l4': 'it was the season of Light, it was the season of Darkness,'},
    {'b1-l5': 'it was the spring of hope, it was the winter of despair,'},
    {'b2-l1': 'The quick brown fox jumps over the lazy dog'},
    {'b2-l2': 'hello'},
    {'b2-l3': 'yes yes yes yes yes'},
    {'b2-l4': 'hello, hello hello. hello! hello'},
    {'b2-l5': '1 2 3 1 2 1'},
    {'b2-l6': 'alpha beta gamma delta epsilon zeta eta theta iota kappa'},
    {'b3-l1': 'the end is near'},
    {'b3-l2': 'the beginning is here'},
    {'b3-l3': 'the middle is now'},
  ];

  const expected = [
    {It: 1}, {was: 10}, {the: 14}, {best: 1},
    {of: 10}, {'times,': 2}, {it: 9}, {worst: 1},
    {age: 2}, {'wisdom,': 1}, {'foolishness,': 1}, {epoch: 2},
    {'belief,': 1}, {'incredulity,': 1}, {season: 2}, {'Light,': 1},
    {'Darkness,': 1}, {spring: 1}, {'hope,': 1}, {winter: 1},
    {'despair,': 1}, {The: 1},
    {quick: 1}, {brown: 1}, {fox: 1}, {jumps: 1},
    {over: 1}, {lazy: 1}, {dog: 1},{hello: 3},
    {'hello,': 1}, {'hello.': 1}, {'hello!': 1},
    {yes: 5},
    {'1': 3}, {'2': 2}, {'3': 1},
    {alpha: 1}, {beta: 1}, {gamma: 1}, {delta: 1},
    {epsilon: 1}, {zeta: 1}, {eta: 1}, {theta: 1},
    {iota: 1}, {kappa: 1},
    {is: 3}, {near: 1}, {end: 1},
    {beginning: 1}, {here: 1},
    {middle: 1}, {now: 1},
  ];

  const doMapReduce = () => {
    distribution.dlib.store.get(null, (e, v) => {
      try {
        expect(v.length).toEqual(dataset.length);
      } catch (e) {
        done(e);
      }

      distribution.dlib.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
        try {
          expect(v).toEqual(expect.arrayContaining(expected));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  };

  let cntr = 0;

  // Send the dataset to the cluster
  dataset.forEach((o) => {
    const key = Object.keys(o)[0];
    const value = o[key];
    distribution.dlib.store.put(value, key, (e, v) => {
      cntr++;
      // Once the dataset is in place, run the map reduce
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
});


test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {
    let counts = {};
    const words = value.split(/\s+/).filter(word => word.length > 0)
    words.forEach(word => {
      if (counts[word]) {
        counts[word] += 1;
      } else {
        counts[word] = 1;
      }
    });
    let out = {}

    for (let word in counts) {
      out[word] = {docID: key, count: counts[word], docLength: words.length};
    }

    return Object.keys(out).map(word => ({ [word]: out[word] }));
  };

  // Reduce function: calculate TF-IDF for each word
  const reducer = (key, values) => {
    const totalDocs = 6;
    numDocs = values.length;
    const idf = Math.log10(totalDocs / numDocs);
    
    docScores = {}
    values.forEach(val => {
      const tf = val.count / val.docLength;
      const tfidf = tf * idf;
      docScores[val.docID] = Number(tfidf.toFixed(2));
    })

    let out = {};
    out[key] = docScores;
    return out;
  };

  const dataset = [
    {'doc1': 'machine learning is amazing'},
    {'doc2': 'deep learning powers amazing systems'},
    {'doc3': 'machine learning and deep learning are related'},
    {'doc4': 'learning learning learning is all I do'},
    {'doc5': 'quantum entanglement produces spooky action'},
    {'doc6': 'machine learning and deep learning powers systems'},
  ];

  const expected = [
    {'learning': {'doc1': 0.02, 'doc2': 0.02, 'doc3': 0.02, 'doc4': 0.03, 'doc6': 0.02}},
    {'machine': {'doc1': 0.08, 'doc3': 0.04, 'doc6': 0.04}},
    {'deep': {'doc2': 0.06, 'doc3': 0.04, 'doc6': 0.04}},
    {'amazing': {'doc1': 0.12, 'doc2': 0.10}},
    {'powers': {'doc2': 0.10, 'doc6': 0.07}},
    {'systems': {'doc2': 0.10, 'doc6': 0.07}},
    {'and': {'doc3': 0.07, 'doc6': 0.07}},
    {'is': {'doc1': 0.12, 'doc4': 0.07}},
    {'are': {'doc3': 0.11}},
    {'related': {'doc3': 0.11}},
    {'quantum': {'doc5': 0.16}},
    {'entanglement': {'doc5': 0.16}},
    {'produces': {'doc5': 0.16}},
    {'spooky': {'doc5': 0.16}},
    {'action': {'doc5': 0.16}},
    {'all': {'doc4': 0.11}},
    {'I': {'doc4': 0.11}},
    {'do': {'doc4': 0.11}},
  ];

  const doMapReduce = () => {
    distribution.tfidf.store.get(null, (e, v) => {
      try {
        expect(v.length).toEqual(dataset.length);
      } catch (e) {
        done(e);
      }

      distribution.tfidf.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
        try {
          expect(v).toEqual(expect.arrayContaining(expected));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  };

  let cntr = 0;

  // Send the dataset to the cluster
  dataset.forEach((o) => {
    const key = Object.keys(o)[0];
    const value = o[key];
    distribution.tfidf.store.put(value, key, (e, v) => {
      cntr++;
      // Once the dataset is in place, run the map reduce
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {

  const patterns = {
    has_email: new RegExp('\\S+@\\S+\\.\\S+'),
    has_url: new RegExp('https?:\\/\\/\\S+'),
    has_phone: new RegExp('\\d{3}-\\d{3}-\\d{4}'),
  };
    
    let out = [];
    
    for (let label in patterns) {
      if (patterns[label].test(value)) {
        out.push({ [label]: key });
      }
    }

    if (out.length === 0) {
      out.push({ __none__: key });
    }
    return out;
  };

  const reducer = (key, values) => {
    const out = {};
    out[key] = [...new Set(values)];
    return out;
  };

  const dataset = [
    {'doc1': 'contact me at john@example.com for details'},
    {'doc2': 'visit https://www.google.com for more info'},
    {'doc3': 'call me at 401-863-1234 anytime'},
    {'doc4': 'email bob@test.org or visit https://bob.io'},
    {'doc5': 'reach out at alice@foo.com or https://foo.com or 555-867-5309'},
    {'doc6': 'no contact info here at all'},
    {'doc7': 'email me at notanemail or call 123-45-678'},
  ];

  const doMapReduce = () => {
    distribution.strmatch.store.get(null, (e, v) => {
      if (e && Object.keys(e).length > 0) { done(e); return; }
      try {
        expect(v.length).toEqual(dataset.length);
      } catch (e) {
        done(e);
        return;
      }

      distribution.strmatch.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
        try {
          expect(v).toEqual(expect.arrayContaining([
            {has_email: expect.arrayContaining(['doc1', 'doc4', 'doc5']) },
            {has_url: expect.arrayContaining(['doc2', 'doc4', 'doc5']) },
            {has_phone: expect.arrayContaining(['doc3', 'doc5']) },
          ]));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  };

  let cntr = 0;

  // Send the dataset to the cluster
  dataset.forEach((o) => {
    const key = Object.keys(o)[0];
    const value = o[key];
    distribution.strmatch.store.put(value, key, (e, v) => {
      cntr++;
      // Once the dataset is in place, run the map reduce
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
});


test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {

    const patterns = {
      has_function_def: new RegExp('function\\s+\\w+\\s*\\('),
      has_variable_decl: new RegExp('\\b(let|const|var)\\s+\\w+'),
      has_comment: new RegExp('\\/\\/.+'),
    };
    
    let out = [];
    
    for (let label in patterns) {
      if (patterns[label].test(value)) {
        out.push({ [label]: key });
      }
    }

    if (out.length === 0) {
      out.push({ __none__: key });
    }
    
    return out;
  };

  const reducer = (key, values) => {
    const out = {};
    out[key] = [...new Set(values)];
    return out;
    

  };

  const dataset = [
    {'doc1': 'function add(a, b) { return a + b; }'},
    {'doc2': 'const x = 10;'},
    {'doc3': 'return result; // this is the result'},
    {'doc4': 'function compute(n) { let result = n * 2; }'},
    {'doc5': 'var total = 0; // initialize total'},
    {'doc6': 'function greet(name) { const msg = "hi"; // say hi }'},
    {'doc7': 'the quick brown fox jumps over the lazy dog'},
    {'doc8': 'functional programming is a paradigm'},
  ];

  const doMapReduce = () => {
    distribution.strmatch2.store.get(null, (e, v) => {
      try {
        expect(v.length).toEqual(dataset.length);
      } catch (e) {
        done(e);
      }

      distribution.strmatch2.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
        try {
          expect(v).toEqual(expect.arrayContaining([
            {has_function_def: expect.arrayContaining(['doc1', 'doc4', 'doc6']) },
            {has_variable_decl: expect.arrayContaining(['doc2', 'doc4', 'doc5', 'doc6']) },
            {has_comment: expect.arrayContaining(['doc3', 'doc5', 'doc6']) },
          ]));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  };

  let cntr = 0;

  // Send the dataset to the cluster
  dataset.forEach((o) => {
    const key = Object.keys(o)[0];
    const value = o[key];
    distribution.strmatch2.store.put(value, key, (e, v) => {
      cntr++;
      // Once the dataset is in place, run the map reduce
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
});


beforeAll((done) => {
  const STORE_DIR = path.resolve(__dirname, '../../node_modules/@brown-ds/distribution/store');
  fs.rmSync(STORE_DIR, { recursive: true, force: true });
  ncdcGroup[id.getSID(n1)] = n1;
  ncdcGroup[id.getSID(n2)] = n2;
  ncdcGroup[id.getSID(n3)] = n3;

  dlibGroup[id.getSID(n1)] = n1;
  dlibGroup[id.getSID(n2)] = n2;
  dlibGroup[id.getSID(n3)] = n3;

  tfidfGroup[id.getSID(n1)] = n1;
  tfidfGroup[id.getSID(n2)] = n2;
  tfidfGroup[id.getSID(n3)] = n3;

  crawlGroup[id.getSID(n1)] = n1;
  crawlGroup[id.getSID(n2)] = n2;
  crawlGroup[id.getSID(n3)] = n3;

  urlxtrGroup[id.getSID(n1)] = n1;
  urlxtrGroup[id.getSID(n2)] = n2;
  urlxtrGroup[id.getSID(n3)] = n3;

  strmatchGroup[id.getSID(n1)] = n1;
  strmatchGroup[id.getSID(n2)] = n2;
  strmatchGroup[id.getSID(n3)] = n3;

  strmatchGroup2[id.getSID(n1)] = n1;
  strmatchGroup2[id.getSID(n2)] = n2;
  strmatchGroup2[id.getSID(n3)] = n3;

  ridxGroup[id.getSID(n1)] = n1;
  ridxGroup[id.getSID(n2)] = n2;
  ridxGroup[id.getSID(n3)] = n3;

  rlgGroup[id.getSID(n1)] = n1;
  rlgGroup[id.getSID(n2)] = n2;
  rlgGroup[id.getSID(n3)] = n3;


  const startNodes = (cb) => {
    distribution.local.status.spawn(n1, (e, v) => {
      distribution.local.status.spawn(n2, (e, v) => {
        distribution.local.status.spawn(n3, (e, v) => {
          cb();
        });
      });
    });
  };

  distribution.node.start(() => {
    const ncdcConfig = {gid: 'ncdc'};
    startNodes(() => {
      distribution.local.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
        distribution.ncdc.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
          const dlibConfig = {gid: 'dlib'};
          distribution.local.groups.put(dlibConfig, dlibGroup, (e, v) => {
            distribution.dlib.groups.put(dlibConfig, dlibGroup, (e, v) => {
              const tfidfConfig = {gid: 'tfidf'};
              distribution.local.groups.put(tfidfConfig, tfidfGroup, (e, v) => {
                distribution.tfidf.groups.put(tfidfConfig, tfidfGroup, (e, v) => {
                  const strMatchGroupConfig = {gid: 'strmatch'};
                  distribution.local.groups.put(strMatchGroupConfig, strmatchGroup, (e, v) => {
                    distribution.strmatch.groups.put(strMatchGroupConfig, strmatchGroup, (e, v) => {
                      const strMatchGroupConfig2 = {gid: 'strmatch2'};
                      distribution.local.groups.put(strMatchGroupConfig2, strmatchGroup2, (e, v) => {
                        distribution.strmatch2.groups.put(strMatchGroupConfig2, strmatchGroup2, (e, v) => {
                          done();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});


afterAll((done) => {
  const remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        if (globalThis.distribution.node.server) {
          globalThis.distribution.node.server.close();
        }
        const STORE_DIR = path.resolve(__dirname, '../../node_modules/@brown-ds/distribution/store');
        fs.rmSync(STORE_DIR, { recursive: true, force: true });
        done();
      });
    });
  });
});

