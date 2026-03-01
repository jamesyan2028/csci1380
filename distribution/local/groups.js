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
  // Lazy init of built-in groups
  if (!('all' in groups)) {
    const localNode = globalThis.distribution.node.config;
    const sid = globalThis.distribution.util.id.getSID(localNode);
    groups['all'] = {[sid]: localNode};
    groups['local'] = {[sid]: localNode};
  }
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
  let hash;
  if (typeof config === 'string') {
    gid = config;
  } else if (config && typeof config === 'object' && config.gid) {
    gid = config.gid;
    hash = config.hash;
  }

  if (typeof gid !== 'string' || gid.length === 0) {
    return callback(new Error(`Invalid GID: ${config}`), null);
  } 

  groups[gid] = group;

  
  globalThis.distribution[gid] = {};

  const serviceConfig = {gid: gid, hash: hash};

  globalThis.distribution[gid].status = require('../all/status')(serviceConfig);
  globalThis.distribution[gid].comm = require('../all/comm')(serviceConfig);
  globalThis.distribution[gid].groups = require('../all/groups')(serviceConfig);
  globalThis.distribution[gid].routes = require('../all/routes')(serviceConfig);
  globalThis.distribution[gid].gossip = require('../all/gossip')(serviceConfig);
  globalThis.distribution[gid].mem = require('../all/mem')(serviceConfig);
  globalThis.distribution[gid].store = require('../all/store')(serviceConfig);
  globalThis.distribution[gid].mr = require('../all/mr')(serviceConfig);

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
  const cb = callback || (() => {});
  const sid = global.distribution.util.id.getSID(node);
  if (name in groups) {
    groups[name][sid] = node;
    cb(null, groups[name]);
  } else {
    cb(new Error(`Group Not Found: ${name}`), null);
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
