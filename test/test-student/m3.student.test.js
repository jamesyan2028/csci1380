
/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/
const { id } = require('@brown-ds/distribution/distribution/util/util.js');

//const distribution = require('../../distribution.js')();
require('../../distribution.js')();
const distribution = globalThis.distribution;
require('../helpers/sync-guard');

const n1 = {ip: '127.0.0.1', port: 8000};
const n2 = {ip: '127.0.0.1', port: 8001};
const n3 = {ip: '127.0.0.1', port: 8002};
const allNodes = [n1, n2, n3];


/*
test('(1 pts) student test', (done) => {
  // Fill out this test case...
  const groupStudentA = {};
  groupStudentA[id.getSID(n1)] = n1;
  groupStudentA[id.getSID(n2)] = n2;
  groupStudentA[id.getSID(n3)] = n3;

  distribution.local.groups.put('groupStudentA', groupStudentA, (e, v) => {
    console.log('groupA services:', Object.keys(distribution.groupStudentA));
    console.log('status service:', distribution.groupStudentA.status);
    distribution.local.status.get('heapTotal', (e, localHeap) => {
      distribution.groupStudentA.status.get('heapTotal', (e, groupHeapMap) => {
        try {
          console.log('e:', JSON.stringify(e));
          console.log('v:', JSON.stringify(v));
          console.log('type of v:', typeof v);
          expect(e).toEqual({});
          expect(groupHeapMap).toBeGreaterThanOrEqual(localHeap)
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});


test('(1 pts) student test', (done) => {
  // Fill out this test case...
  const groupStudentB = {};
  groupStudentB[id.getSID(n1)] = n1;
  groupStudentB[id.getSID(n2)] = n2;

  distribution.local.groups.put('groupStudentB', groupStudentB, (e, v) => {
    distribution.local.groups.rem('groupStudentB', id.getSID(n2), (e, v) => {
      distribution.groupStudentB.status.get('sid', (e, v) => {
        try {
          expect(e).toEqual({});
          const responses = Object.keys(v);
          expect(responses).toBeDefined();
          expect(responses).toHaveLength(1);
          expect(responses).toContain(id.getSID(n1));
          expect(responses).not.toContain(id.getSID(n2));
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
*/

test('(1 pts) student test', (done) => {
  const groupA = {};
  groupA[id.getSID(n1)] = n1;
  groupA[id.getSID(n2)] = n2;
  groupA[id.getSID(n3)] = n3;

  distribution.local.groups.put('groupA', groupA, (e, v) => {
    distribution.groupA.status.get('nid', (e, v) => {
      try {
        expect(e).toEqual({});
        const nids = Object.values(v);
        expect(nids).toHaveLength(3);
        expect(nids).toContain(id.getNID(n1));
        expect(nids).toContain(id.getNID(n2));
        expect(nids).toContain(id.getNID(n3));
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});


test('(1 pts) student test', (done) => {
  const groupB = {};
  groupB[id.getSID(n1)] = n1;
  groupB[id.getSID(n2)] = n2;

  distribution.local.groups.put('groupB', groupB, (e, v) => {
    distribution.local.groups.rem('groupB', id.getSID(n2), (e, v) => {
      distribution.groupB.status.get('nid', (e, v) => {
        try {
          expect(e).toEqual({});
          const nids = Object.values(v);
          expect(nids).toHaveLength(1);
          expect(nids).toContain(id.getNID(n1));
          expect(nids).not.toContain(id.getNID(n2));
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  const groupC = {};
  groupC[id.getSID(n1)] = n1;
  groupC[id.getSID(n2)] = n2;
  groupC[id.getSID(n3)] = n3;

  const newService = {
    ping: (args, callback) => {
      callback(null, 'pong')
    },
  };
  distribution.local.groups.put('groupC', groupC, (e, v) => {
    distribution.groupC.routes.put(newService, 'newService', (e, v) => {
      const remote = {
        node: n2,
        service: 'newService',
        method: 'ping'
      };

      distribution.local.comm.send([], remote, (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toBe('pong');
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  // Fill out this test case...
  const groupD = {};
  const groupE = {};
  groupD[id.getSID(n1)] = n1;
  groupE[id.getSID(n2)] = n2;
  groupE[id.getSID(n3)] = n3;

  distribution.local.groups.put('groupD', groupD, (e, v) => {
    distribution.local.groups.put('groupE', groupE, (e, v) => {
      distribution.groupD.groups.put('groupE', groupE, (e, v) => {
        const remote = {
          node: n1,
          service: 'groups',
          method: 'get',
        };
        distribution.local.comm.send(['groupE'], remote, (e, v) => {
          try {
            expect(e).toBeFalsy();
            expect(v[id.getSID(n2)]).toBeDefined();
            expect(v[id.getSID(n3)]).toBeDefined();
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  // Fill out this test case...
  const groupF = {};
  groupF[id.getSID(n1)] = n1;
  groupF[id.getSID(n2)] = n2;
  groupF[id.getSID(n3)] = n3;

  distribution.local.groups.put('groupF', groupF, (e, v) => {
    distribution.groupF.groups.put('groupF', groupF, (e, v) => {
      distribution.groupF.groups.rem('groupF', id.getSID(n2), (e, v) => {
        const remote = {
          node: n1,
          service: 'groups',
          method: 'get',
        }
        distribution.local.comm.send(['groupF'], remote, (e, v) => {
          try {
            expect(e).toBeFalsy();
            expect(Object.keys(v)).toHaveLength(2);
            expect(v[id.getSID(n1)]).toBeDefined();
            expect(v[id.getSID(n3)]).toBeDefined();
            expect(v[id.getSID(n2)]).not.toBeDefined();
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });
});


//Startup code copied from scenarios
function startAllNodes(callback) {
  distribution.node.start(() => {
    function startStep(step) {
      if (step >= allNodes.length) {
        callback();
        return;
      }

      distribution.local.status.spawn(allNodes[step], (e, v) => {
        if (e) {
          return callback(e);
        }
        startStep(step + 1);
      });
    }
    startStep(0);
  });
}


function stopAllNodes(callback) {
  const remote = {method: 'stop', service: 'status'};

  function stopStep(step) {
    if (step == allNodes.length) {
      callback();
      return;
    }

    if (step < allNodes.length) {
      remote.node = allNodes[step];
      distribution.local.comm.send([], remote, (e, v) => {
        stopStep(step + 1);
      });
    }
  }

  if (globalThis.distribution.node.server) {
    globalThis.distribution.node.server.close();
  }
  stopStep(0);
}

beforeAll((done) => {
  // Stop any leftover nodes

  stopAllNodes(() => {
    startAllNodes(done);
  });
});

afterAll((done) => {
  stopAllNodes(done);
});
