// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 *
 * @typedef {Object} StoreConfig
 * @property {string | null} key
 * @property {string | null} gid
 *
 * @typedef {StoreConfig | string | null} SimpleConfig
 */

const { id } = require("../util/util.js");

const store = {};

function parseConfig(config) {
  if (config === null) {
    return {key: null, gid: 'local'};
  }
  if (typeof config === 'string') {
    return {key: config, gid: 'local'};
  }
  return {
    key: config.key ?? null,
    gid: config.gid ?? 'local',
  };
}

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function put(state, configuration, callback) {
  try {
    let {key, gid} = parseConfig(configuration);
    if (key === null) {
      key = id.getID(state);
    }
    const storeKey = `${gid}:${key}`;
    store[storeKey] = state;
    callback(null, state);
  } catch(e) {
    callback(e, null);
  }
};

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function append(state, configuration, callback) {
  return callback(new Error('mem.append not implemented')); // You'll need to implement this method for the distributed processing milestone.
};

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function get(configuration, callback) {
  const {key, gid} = parseConfig(configuration);
  if (key === null) {
    return callback(new Error('Cannot get with null As Key'), null);
  } 

  const storeKey = `${gid}:${key}`;
  if (!(storeKey in store)) {
    return callback(new Error(`Key ${key} not in group ${gid} store`), null);
  }
  return callback(null, store[storeKey]);
}

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function del(configuration, callback) {
  const {key, gid} = parseConfig(configuration);
  if (key === null) {
    return callback(new Error(`Cannot delete with null as key`), null);
  }

  const storeKey = `${gid}:${key}`;
  if (!(storeKey in store)) {
    return callback(new Error(`Key ${key} not found in group ${gid}`), null);
  }

  const value = store[storeKey];
  delete store[storeKey];
  return callback(null, value);

};

module.exports = {put, get, del, append};
