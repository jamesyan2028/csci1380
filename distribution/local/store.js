// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 *
 * @typedef {Object} StoreConfig
 * @property {?string} key
 * @property {?string} gid
 *
 * @typedef {StoreConfig | string | null} SimpleConfig
 */

/* Notes/Tips:

- Use absolute paths to make sure they are agnostic to where your code is running from!
  Use the `path` module for that.
*/

const path = require('path');
const fs = require('fs');
const serialization = require(`../util/serialization.js`);
const { id } = require("../util/util.js");

const STORE_DIR = path.resolve(__dirname, `../../store`);

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


function sanitizeKey(key) {
  return key.replace(/[^a-zA-Z0-9]/g, '');
}

function getGidDir(gid) {
  const dir = path.join(STORE_DIR, gid);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  return dir
}

function getPath(gid, key) {
  return path.resolve(getGidDir(gid), sanitizeKey(key));
}



/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function put(state, configuration, callback) {
  let {key, gid} = parseConfig(configuration);
  if (key === null) {
    key = id.getID(state);
  }

  const path = getPath(gid, key);
  try {
    fs.writeFileSync(path, serialization.serialize(state));
    return callback(null, state);
  } catch (e) {
    return callback(e, null);
  }
}

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function get(configuration, callback) {
  const {key, gid} = parseConfig(configuration);
  if (key === null) {
    const gidDir = getGidDir(gid);
    try {
      const files = fs.readdirSync(gidDir);
      return callback(null, files);
    } catch (e) {
      return callback(e, null);
    }
  }

  const path = getPath(gid, key);
  if (!fs.existsSync(path)) {
    return callback(new Error(`Key '${key}' not found in gid '${gid}'`), null);
  }

  try {
    const raw = fs.readFileSync(path, 'utf8');
    return callback(null, serialization.deserialize(raw));
  } catch (e) {
    return callback(e, null);
  }
}

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function del(configuration, callback) {
  const {gid, key} = parseConfig(configuration);
  if (key === null) {
    return callback(new Error('Cannot call delete with null as key'), null);
  }

  const path = getPath(gid, key);
  if (!fs.existsSync(path)) {
    return callback(new Error(`Key '${key}' not found in gid '${gid}'`), null)
  }

  try {
    const raw = fs.readFileSync(path, 'utf8');
    const deserialized = serialization.deserialize(raw);
    fs.unlinkSync(path);
    return callback(null, deserialized);
  } catch (e) {
    return callback(e, null);
  }
}

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function append(state, configuration, callback) {
  const {key, gid} = parseConfig(configuration);
  if (key === null) return callback(new Error('Cannot append with null key'), null);

  const path = getPath(gid, key);

  let curr = [];
  if (fs.existsSync(path)) {
    try {
      curr = serialization.deserialize(fs.readFileSync(path, 'utf8'));
    } catch (e) {
      return callback(e, null);
    }
  }

  curr.push(state);
  try {
    fs.writeFileSync(path, serialization.serialize(curr));
    return callback(null, curr);
  } catch (e) {
    return callback(e, null);
  }
}

module.exports = {put, get, del, append};
