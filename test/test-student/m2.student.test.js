/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const util = require('@brown-ds/distribution/distribution/util/util.js');

const distribution = require('../../distribution.js')();
require('../helpers/sync-guard');

test('(1 pts) student test', (done) => {
  distribution.local.status.get('nid', (e, v) => {
    try {
      expect(e).toBeFalsy();
      expect(v).toBeDefined();
      expect(v.length).toBe(64);
      done();
    } catch (error) {
      done(error);
    }
  });
});


test('(1 pts) student test', (done) => {
  // Fill out this test case...
  const expectedValues = ['nid', 'sid', 'ip', 'port', 'counts', 'heapTotal', 'heapUsed'];
  let complete = 0;
  expectedValues.forEach((key) => {
    distribution.local.status.get(key, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toBeDefined();

        if (['nid', 'sid', 'ip'].includes(key)) {
          expect(typeof v).toBe('string');
        }
        if (['port', 'counts', 'heapTotal', 'heapUsed'].includes(key)) {
          expect(typeof v).toBe('number');
        }

        if (key === 'nid') {
          expect(v.length).toBe(64);
        }
        if (key === 'sid') {
          expect(v.length).toBe(5);
        }

        complete += 1;

        if (complete === expectedValues.length) {
          done();
        }
      } catch (error) {
        done(error);
      }
    });
  });
});


test('(1 pts) student test', (done) => {
  const service = {testMethod: (callback) => callback(null, 'test')};
  distribution.local.routes.put(service, 'testService', (e, v) => {
    try {
      expect(e).toBeFalsy();
      expect(v).toBe('testService');
      done();
    } catch (error) {
      done(error);
    }
  })
});

test('(1 pts) student test', (done) => {
  const service1 = {f: (callback) => callback(null, 'apple')};
  const service2 = {g: (callback) => callback(null, 'banana')};

  distribution.local.routes.put(service1, "appleService", (e, v) => {
    distribution.local.routes.put(service2, "bananaService", (e, v) => {
      distribution.local.routes.get('appleService', (e, s1) => {
        s1.f((e, r1) => {
          distribution.local.routes.get('bananaService', (e, s2) => {
            s2.g((e, r2) => {
              try {
                expect(r1).toBe('apple');
                expect(r2).toBe('banana');
                done()
              } catch (error) {
                done(error);
              }
            });
          });
        });
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  const printService = {f: (msg, callback) => callback(null, msg)};
  distribution.local.routes.put(printService, 'printer', (e, v) => {
    distribution.local.routes.get('printer', (e, service) => {
      try {
        expect(e).toBeFalsy();
        service.f('Mango', (e, r) => {
          expect(r).toBe('Mango');
          done();
        });
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  distribution.local.routes.get('bruh', (e, service) => {
    try {
      expect(e).toBeInstanceOf(Error);
      expect(service).toBeFalsy();
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) student test', (done) => {
  const service = {f: (callback) => callback(null, 'watermelon')};
  distribution.local.routes.put(service, 'deleteFunc', (e, v) => {
    distribution.local.routes.rem('deleteFunc', (e, v) => {
      distribution.local.routes.get('deleteFunc', (e, v) => {
        try {
          expect(e).toBeInstanceOf(Error);
          expect(v).toBeFalsy();
          done();
        } catch (error) { 
          done(error);
        }
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  const s1 = {f: (callback) => callback(null, 1)};
  const s2 = {f: (callback) => callback(null, 2)};
  distribution.local.routes.put(s1, 'keepFunc', (e, v) => {
    distribution.local.routes.put(s2, 'deleteFunc', (e, v) => {
      distribution.local.routes.rem('deleteFunc', (e, v) => {
        distribution.local.routes.get('keepFunc', (e, service) => {
          try {
            expect(e).toBeFalsy();
            expect(service).toBeDefined();
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
  const remote = {node: distribution.node.config};
  const message = ['nid'];
  const config = global.distribution.node.config;
  distribution.node.start((err) => {
    if (err) {
      return done(err);
    }
    distribution.local.comm.send(message, {node: remote.node, service: 'status', method: 'get'}, (e, v) => {
      try {
        expect(e).toBeFalsy();
        const nodeInfo = {
          ip: config.ip,
          port: config.port,
        }
        expect(v).toBe(util.id.getNID(nodeInfo));
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  const badNode = {ip: '127.0.0.1', port: 1};
  const message = ['nid'];
  distribution.local.comm.send(message, {node: badNode, service: 'status', method: 'get'}, (e, v) => {
    try {
      expect(e).not.toBeNull();
      expect(v).toBeFalsy();
      distribution.node.server.close();
      done();
    } catch (error) {
      distribution.node.server.close();
      done(error);
    }
  });
});



