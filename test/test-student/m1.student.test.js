
/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const { serialize } = require('@brown-ds/distribution/distribution/util/util.js');

const distribution = require('../../distribution.js')();
require('../helpers/sync-guard');
const util = distribution.util;

test('(1 pts) student test', () => {
  // Fill out this test case...
  let obj = "abcdefghijkl";
  const serialized = util.serialize(obj);

  expect(serialized.length).toEqual(40);

  let obj2 = {
    a: 1,
    b: 2,
    c: [3, 4, 5],
  }

  const serialized2 = util.serialize(obj2);
  expect(serialized2.length).toEqual(228);

  let obj3 = null;
  const serialized3 = util.serialize(obj3);
  expect(serialized3.length).toEqual(26);

  let obj4 = undefined;
  const serialized4 = util.serialize(obj4);
  expect(serialized4.length).toEqual(31);

  let obj5 = true;
  const serialized5 = util.serialize(obj5);
  expect(serialized5.length).toEqual(33);

  let obj6 = 123.34;
  const serialized6 = util.serialize(obj6);
  expect(serialized6.length).toEqual(34);

  let obj7 = [1, "two", 3];
  const serialized7 = util.serialize(obj7);
  expect(serialized7.length).toEqual(130);

  let obj8 = new Date(0);
  const serialized8 = util.serialize(obj8);
  expect(serialized8.length).toEqual(50);

  let obj9 = (x) => x + 1;
  const serialized9 = util.serialize(obj9);
  expect(serialized9.length).toEqual(40);

  let obj10 = new Error("Something went wrong!");
  const serialized10 = util.serialize(obj10);
  expect(serialized10.length).toEqual(193);

});


test('(1 pts) student test', () => {
  // Fill out this test case...
  let obj = 123;
  const serialized = util.serialize(obj);
  const expected = '{"type":"number","value":"123"}';
  expect(serialized).toEqual(expected);

  let obj2 = ["1", "2", "3"];
  const serialized2 = util.serialize(obj2);
  const expected2 = '{"type":"array","value":{"0":{"type":"string","value":"1"},"1":{"type":"string","value":"2"},"2":{"type":"string","value":"3"}}}';
  expect(serialized2).toEqual(expected2);

  let obj3 = null;
  const serialized3 = util.serialize(obj3);
  const expected3 = '{"type":"null","value":""}';
  expect(serialized3).toEqual(expected3);

  let obj4 = undefined;
  const serialized4 = util.serialize(obj4);
  const expected4 = '{"type":"undefined","value":""}';
  expect(serialized4).toEqual(expected4);

  let obj5 = false;
  const serialized5 = util.serialize(obj5);
  const expected5 = '{"type":"boolean","value":"false"}';
  expect(serialized5).toEqual(expected5);

  let obj6 = "abc";
  const serialized6 = util.serialize(obj6);
  const expected6 = '{"type":"string","value":"abc"}';
  expect(serialized6).toEqual(expected6);

  let obj7 = {x: 10, y: "test"};
  const serialized7 = util.serialize(obj7);
  const expected7 = '{"type":"object","value":{"x":{"type":"number","value":"10"},"y":{"type":"string","value":"test"}}}'
  expect(serialized7).toEqual(expected7);

  let obj8 = new Date(0);
  const serialized8 = util.serialize(obj8);
  const expected8 = '{"type":"date","value":"1970-01-01T00:00:00.000Z"}';
  expect(serialized8).toEqual(expected8);

  const obj9 = (x) => x * 2;
  const serialized9 = util.serialize(obj9);
  const expected9 = '{"type":"function","value":"x => x * 2"}';
  expect(serialized9).toEqual(expected9);

  const obj10 = function(a, b) {
    return a + b;
  }
  const serialized10 = util.serialize(obj10);
  const expected10 = '{"type":"function","value":"function (a, b) {\\n    return a + b;\\n  }"}';
  expect(serialized10).toEqual(expected10);

  const obj11 = new Error("Something went wrong!");
  const serialized11 = util.serialize(obj11);
  const expected11 = '{"type":"error","value":{"type":"object","value":{"name":{"type":"string","value":"Error"},"message":{"type":"string","value":"Something went wrong!"},"cause":{"type":"undefined","value":""}}}}'
  expect(serialized11).toEqual(expected11);
});



test('(1 pts) student test', () => {
  // Fill out this test case...
  const s1 = '{"type":"number","value":"123"}';
  expect(util.deserialize(s1)).toEqual(123);

  const s2 = '{"type":"array","value":{"0":{"type":"string","value":"1"},"1":{"type":"string","value":"2"},"2":{"type":"string","value":"3"}}}';
  expect(util.deserialize(s2)).toEqual(["1", "2", "3"]);

  const s3 = '{"type":"null","value":""}';
  expect(util.deserialize(s3)).toEqual(null);

  const s4 = '{"type":"undefined","value":""}';
  expect(util.deserialize(s4)).toEqual(undefined);

  const s5 = '{"type":"boolean","value":"false"}';
  expect(util.deserialize(s5)).toEqual(false);

  const s6 = '{"type":"string","value":"abc"}';
  expect(util.deserialize(s6)).toEqual("abc");

  const s7 = '{"type":"object","value":{"x":{"type":"number","value":"10"},"y":{"type":"string","value":"test"}}}';
  expect(util.deserialize(s7)).toEqual({x: 10, y: "test"});

  const s8 = '{"type":"date","value":"1970-01-01T00:00:00.000Z"}';
  const revivedDate = util.deserialize(s8);
  expect(revivedDate instanceof Date).toEqual(true);
  expect(revivedDate.getTime()).toEqual(0);

  const s9 = '{"type":"function","value":"(x) => x * 2"}';
  const revivedFn9 = util.deserialize(s9);
  expect(revivedFn9(5)).toEqual(10);

  const s10 = '{"type":"function","value":"function(a, b) {\\nreturn a + b;\\n}"}';
  const revivedFn10 = util.deserialize(s10);
  expect(revivedFn10(1, 2)).toEqual(3);
});

test('(1 pts) student test', () => {
  const obj = {
    num: 42,
    str: "abc",
    bool: true,
    none: null,
    undef: undefined,
    date: new Date(0),
    list: [1, "two", false],
    nested: { key: "value" },
    fn: function(a, b) { return a + b; }
  };
  const serialized = util.serialize(obj);
  expect(serialized).toEqual('{"type":"object","value":{"num":{"type":"number","value":"42"},"str":{"type":"string","value":"abc"},"bool":{"type":"boolean","value":"true"},"none":{"type":"null","value":""},"undef":{"type":"undefined","value":""},"date":{"type":"date","value":"1970-01-01T00:00:00.000Z"},"list":{"type":"array","value":{"0":{"type":"number","value":"1"},"1":{"type":"string","value":"two"},"2":{"type":"boolean","value":"false"}}},"nested":{"type":"object","value":{"key":{"type":"string","value":"value"}}},"fn":{"type":"function","value":"function (a, b) {\\n      return a + b;\\n    }"}}}');

});

test('(1 pts) student test', () => {
  // Fill out this test case...
  let obj = '{"type":"number","value":"123"';
  expect(() => {
    util.deserialize(obj);
  }).toThrow(SyntaxError);

  let obj2 = "bruh";
  expect(() => {
    util.deserialize(obj2);
  }).toThrow(SyntaxError);
});
