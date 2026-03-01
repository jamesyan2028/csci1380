// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").Node} Node
 */

const node = require("../local/node.js");


/**
 * @typedef {Object} StoreConfig
 * @property {string | null} key
 * @property {string} gid
 *
 * @typedef {StoreConfig | string | null} SimpleConfig
 *
 * @typedef {Object} Mem
 * @property {(configuration: SimpleConfig, callback: Callback) => void} get
 * @property {(state: any, configuration: SimpleConfig, callback: Callback) => void} put
 * @property {(state: any, configuration: SimpleConfig, callback: Callback) => void} append
 * @property {(configuration: SimpleConfig, callback: Callback) => void} del
 * @property {(configuration: Object.<string, Node>, callback: Callback) => void} reconf
 */


/**
 * @param {Config} config
 * @returns {Mem}
 */
function mem(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.hash = config.hash || globalThis.distribution.util.id.naiveHash;

  function getNode(gid, key, callback) {
    globalThis.distribution.local.groups.get(gid, (e, group) => {
      if (e) {
        return callback(e, null);
      }

      const nids = Object.values(group).map((node) => globalThis.distribution.util.id.getNID(node));
      const kid = globalThis.distribution.util.id.getID(key);

      const targetNID = context.hash(kid, nids);

      const targetNode = Object.values(group).find(
        (node) => globalThis.distribution.util.id.getNID(node) === targetNID
      );

      if (!targetNode) {
        return callback(new Error(`Could not find node for key ${key}`), null);
      }
      return callback(null, targetNode);
    });
  }
  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function get(configuration, callback) {
    const key = typeof configuration === 'string' ? configuration : configuration?.key;
    const gid = (typeof configuration === 'object' && configuration !== null && configuration.gid)
    ? configuration.gid
    : context.gid;

    if (key === null) {
      return callback(new Error(`Cannot get with null as key`), null);
    }

    getNode(gid, key, (e, node) => {
      if (e) {
        return callback(e, null);
      }
      const remote = {node: node, service: `mem`, method: `get`};
      const localConfig = {key: key, gid: gid};
      globalThis.distribution.local.comm.send([localConfig], remote, callback);
    });
  }

  /**
   * @param {any} state
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function put(state, configuration, callback) {
    let key = typeof configuration === 'string' ? configuration : configuration?.key;
    const gid = (typeof configuration === 'object' && configuration !== null && configuration.gid)
    ? configuration.gid
    : context.gid;

    if (key === null) {
      key = globalThis.distribution.util.id.getID(state);
    }

    getNode(gid, key, (e, node) => {
      if (e) {
        return callback(e, null);
      }
      const remote = {node: node, service: `mem`, method: `put`};
      const localConfig = {key: key, gid: gid};
      globalThis.distribution.local.comm.send([state, localConfig], remote, callback);
    });
  }

  /**
   * @param {any} state
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function append(state, configuration, callback) {
    return callback(new Error('mem.append not implemented')); // You'll need to implement this method for the distributed processing milestone.
  }

  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function del(configuration, callback) {
    const key = typeof configuration === 'string' ? configuration : configuration?.key;
    const gid = (typeof configuration === 'object' && configuration !== null && configuration.gid)
    ? configuration.gid
    : context.gid;

    if (key === null) {
      return callback(new Error(`Delete key cannot be null`), null);
    }

    getNode(gid, key, (e, node) => {
      if (e) {
        return callback(e, null);
      }

      const remote = {node: node, service: `mem`, method: `del`};
      const localConfig = {key: key, gid: gid};
      globalThis.distribution.local.comm.send([localConfig], remote, callback);
    });
  }

  /**
   * @param {Object.<string, Node>} configuration
   * @param {Callback} callback
   */
  function reconf(configuration, callback) {
    return callback(new Error('mem.reconf not implemented'));
  }
  /* For the distributed mem service, the configuration will
          always be a string */
  return {
    get,
    put,
    append,
    del,
    reconf,
  };
}

module.exports = mem;
