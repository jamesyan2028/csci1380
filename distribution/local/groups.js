// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").Node} Node
 */

/**
 * @param {string} name
 * @param {Callback} callback
 */
function get(name, callback) {
  return callback(new Error('groups.get not implemented'));
}

/**
 * @param {Config | string} config
 * @param {Object.<string, Node>} group
 * @param {Callback} callback
 */
function put(config, group, callback) {
  return callback(new Error('groups.put not implemented'));
}

/**
 * @param {string} name
 * @param {Callback} callback
 */
function del(name, callback) {
  return callback(new Error('groups.del not implemented'));
}

/**
 * @param {string} name
 * @param {Node} node
 * @param {Callback} callback
 */
function add(name, node, callback) {
  return callback(new Error('groups.add not implemented'));
};

/**
 * @param {string} name
 * @param {string} node
 * @param {Callback} callback
 */
function rem(name, node, callback) {
  return callback(new Error('groups.rem not implemented'));
};

module.exports = {get, put, del, add, rem};
