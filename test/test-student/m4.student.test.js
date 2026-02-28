/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const { rendezvousHash, consistentHash } = require('@brown-ds/distribution/distribution/util/id.js');
const { id } = require('@brown-ds/distribution/distribution/util/util.js');
const { isExportDeclaration } = require('typescript');

const distribution = require('../../distribution.js')();
require('../helpers/sync-guard');
const util = distribution.util; 

const n1 = {ip: '127.0.0.1', port: 9001};
const n2 = {ip: '127.0.0.1', port: 9002};
const n3 = {ip: '127.0.0.1', port: 9003};
const n4 = {ip: '127.0.0.1', port: 9004};
const n5 = {ip: '127.0.0.1', port: 9005};
const n6 = {ip: '127.0.0.1', port: 9006};

test('(1 pts) student test', (done) => {
  const value = {field1: 'a', fiel2: 'bruh'};
  const key = 'skib';
  distribution.local.mem.put(value, key, (e, v) => {
    expect(e).toBeFalsy();
    expect(v).toEqual(value);
    distribution.local.mem.get(key, (e, v) => {
      expect(e).toBeFalsy();
      expect(v).toEqual(value);
      distribution.local.mem.del(key, (e, v) => {
        expect(e).toBeFalsy();
        expect(v).toEqual(value);
        distribution.local.mem.get(key, (e, v) => {
          expect(e).toBeInstanceOf(Error);
          distribution.local.mem.del(key, (e, v) => {
            expect(e).toBeInstanceOf(Error);
            done();
          });
        });
      });
    });
  });
});


test('(1 pts) student test', (done) => {
  const value = {field1: 'a', field2: 'bruh'};
  const key = 'skib';
  distribution.local.store.put(value, key, (e, v) => {
    expect(e).toBeFalsy();
    expect(v).toEqual(value);
    distribution.local.store.get(key, (e, v) => {
      expect(e).toBeFalsy();
      expect(v).toEqual(value);
      distribution.local.store.put(value, null, (e, nullPutv) => {
        expect(e).toBeFalsy();
        expect(nullPutv).toEqual(value);
        const newKey = distribution.util.id.getID(v);
        distribution.local.store.get(newKey, (e, v) => {
          expect(e).toBeFalsy();
          expect(v).toEqual(nullPutv);
          distribution.local.store.del(newKey, (e, v) => {
            expect(e).toBeFalsy();
            expect(v).toEqual(nullPutv);
            done();
          });
        });
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  const groupA = {}
  groupA[id.getSID(n1)] = n1;
  groupA[id.getSID(n2)] = n2;
  groupA[id.getSID(n3)] = n3;

  const keysAndValues = [
    {key: 'a', value: 'bruh'},
    {key: 'b', value: 'bruh2'},
    {key: 'c', value: 'bruh3'},
    {key: 'd', value: 'bruh4'},
    {key: 'e', value: 'bruh5'}
  ];

  const config = {gid: 'groupA', hash: util.id.consistentHash};

  distribution.local.groups.put(config, groupA, (e, v) => {
    expect(e).toBeFalsy();

    let i = 0;
    const putHelper = () => {
      if (i >= keysAndValues.length) {
        return getAll();
      }
      const {key, value} = keysAndValues[i];
      i += 1;
      distribution.groupA.mem.put(value, key, (e, v) => {
        expect(e).toBeFalsy();
        expect(v).toEqual(value);
        putHelper();
      });
    }

    const getAll = () => {
      let j = 0;
      const getNext = () => {
        if (j >= keysAndValues.length) {
          return deleteOne();
        }
        const {key, value} = keysAndValues[j];
        j += 1
        distribution.groupA.mem.get(key, (e, v) => {
          expect(e).toBeFalsy();
          expect(v).toBe(value);
          getNext();
        });
      }
      getNext();
    }

    const deleteOne = () => {
      distribution.groupA.mem.del('c', (e, v) => {
        expect(e).toBeFalsy();
        expect(v).toBe('bruh3');
        distribution.groupA.mem.get('c', (e, v) => {
          expect(e).toBeInstanceOf(Error);
          done();
        });
      });
    }
    putHelper();
  });
});

test('(1 pts) student test', (done) => {
  const nodes = [n1, n2, n3, n4, n5, n6];
  const nids = nodes.map((n) => id.getNID(n));
  
  const testKeys = ['bruh', '123', '%JD*', 'skib'];
  for (key of testKeys) {
    const kid = id.getID(key)

    const rh1 = rendezvousHash(kid, [...nids]);
    const rh2 = rendezvousHash(kid, [...nids]);
    expect(rh1).toBe(rh2);
    expect(nids).toContain(rh1);

    const ch1 = consistentHash(kid, [...nids]);
    const ch2 = consistentHash(kid, [...nids]);
    expect(ch1).toBe(ch2);
    expect(nids).toContain(ch1);
  }
  done();
});

test('(1 pts) student test', (done) => {
  const groupA = {};
  const groupB = {};

  groupA[id.getSID(n1)] = n1;
  groupA[id.getSID(n2)] = n2;
  groupA[id.getSID(n3)] = n3;

  groupB[id.getSID(n1)] = n1;
  groupB[id.getSID(n2)] = n2;
  groupB[id.getSID(n3)] = n3;

  const sharedKey = 'skib';
  const valA = {val: 'bruh'};
  const valB = {val: 'bruh2'};

  const configA = {gid: 'groupA', hash: util.id.consistentHash};
  const configB = {gid: 'groupB', hash: util.id.consistentHash};

  distribution.local.groups.put(configA, groupA, (e, v) => {
    expect(e).toBeFalsy();
    distribution.local.groups.put(configB, groupB, (e, v) => {
      expect(e).toBeFalsy();
      distribution.groupA.store.put(valA, sharedKey, (e, v) => {
        expect(e).toBeFalsy();
        expect(v).toEqual(valA);
        distribution.groupB.store.put(valB, sharedKey, (e, v) => {
          expect(e).toBeFalsy();
          expect(v).toEqual(valB);
          distribution.groupA.store.get(sharedKey, (e, v) => {
            expect(e).toBeFalsy();
            expect(v).toEqual(valA);
            distribution.groupB.store.get(sharedKey, (e, v) => {
              expect(e).toBeFalsy();
              expect(v).toEqual(valB);
              done();
            });
          });
        });
      });
    });
  });
});


beforeAll((done) => {
  // First, stop the nodes if they are running
  const remote = {service: 'status', method: 'stop'};

  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            remote.node = n6;
            distribution.local.comm.send([], remote, (e, v) => {
              startNodes();
            });
          });
        });
      });
    });
  });

  const startNodes = () => {
    // Now, start the nodes listening node
    distribution.node.start(() => {
      // Start the nodes
      distribution.local.status.spawn(n1, (e, v) => {
        distribution.local.status.spawn(n2, (e, v) => {
          distribution.local.status.spawn(n3, (e, v) => {
            distribution.local.status.spawn(n4, (e, v) => {
              distribution.local.status.spawn(n5, (e, v) => {
                distribution.local.status.spawn(n6, (e, v) => {
                  done();
                });
              });
            });
          });
        });
      });
    });
  };
});


afterAll((done) => {
  const remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            remote.node = n6;
            distribution.local.comm.send([], remote, (e, v) => {
              if (globalThis.distribution.node.server) {
                globalThis.distribution.node.server.close();
              }
              done();
            });
          });
        });
      });
    });
  });
});
