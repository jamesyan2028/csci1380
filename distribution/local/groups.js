// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").Node} Node
 */
const groups = {};

/**
 * @param {string} name
 * @param {Callback} callback
 */
function get(name, callback) {
  if (name in groups) {
    callback(null, groups[name]);
  } else {
    callback(new Error(`Group ${name} not found`), null);
  }
}

/**
 * @param {Config | string} config
 * @param {Object.<string, Node>} group
 * @param {Callback} callback
 */
function put(config, group, callback) {
  let gid;
  if (typeof config === 'string') {
    gid = config;
  } else if (config && typeof config === 'object' && config.gid) {
    gid = config.gid;
  }

  if (typeof gid !== 'string' || gid.length === 0) {
    return callback(new Error(`Invalid GID: ${config}`), null);
  }

  groups[gid] = group;

  globalThis.distribution[gid] = {};

  globalThis.distribution[gid].status = require('../all/status')({gid: gid});
  globalThis.distribution[gid].comm = require('../all/comm')({gid: gid});
  globalThis.distribution[gid].groups = require('../all/groups')({gid: gid});
  globalThis.distribution[gid].routes = require('../all/routes')({gid: gid});
  globalThis.distribution[gid].gossip = require('../all/gossip')({gid: gid});
  globalThis.distribution[gid].mem = require('../all/mem')({gid: gid});
  globalThis.distribution[gid].store = require('../all/store')({gid: gid});
  globalThis.distribution[gid].mr = require('../all/mr')({gid: gid});

  callback(null, group);
}

/**
 * @param {string} name
 * @param {Callback} callback
 */
function del(name, callback) {
  if (name in groups) {
    const target = groups[name];
    delete groups[name];
    delete globalThis.distribution[name];
    callback(null, target);
  } else {
    callback(new Error(`Group Not Found: ${name}`), null);
  }
}

/**
 * @param {string} name
 * @param {Node} node
 * @param {Callback} callback
 */
function add(name, node, callback) {
  const sid = global.distribution.util.id.getSID(node);
  if (name in groups) {
    groups[name][sid] = node;
    callback(null, node);
  } else {
    callback(new Error(`Group Not Found: ${name}`), null);
  }
};

/**
 * @param {string} name
 * @param {string} node
 * @param {Callback} callback
 */
function rem(name, node, callback) {
  if (name in groups && node in groups[name]) {
    const target = groups[name][node];
    delete groups[name][node];
    callback(null, target);
  } else {
    callback(new Error(`Invalid Node ${node} or Group ${name}`), null);
  }
};

module.exports = {get, put, del, add, rem};
