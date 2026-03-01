// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").Hasher} Hasher
 * @typedef {import("../types.js").Node} Node
 */


/**
 * @typedef {Object} StoreConfig
 * @property {string | null} key
 * @property {string} gid
 *
 * @typedef {StoreConfig | string | null} SimpleConfig
 */


/**
 * @param {Config} config
 */
function store(config) {
  const context = {
    gid: config.gid || 'all',
    hash: config.hash || globalThis.distribution.util.id.naiveHash,
    subset: config.subset,
  };

  function getNode(key, callback) {
    globalThis.distribution.local.groups.get(context.gid, (e, group) => {
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

    if (key === null || key == undefined) {
      return callback(new Error(`Cannot get with null as key`), null);
    }

    getNode(key, (e, node) => {
      if (e) {
        return callback(e, null);
      }
      const remote = {node: node, service: `store`, method: `get`};
      const localConfig = {key: key, gid: context.gid};
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
    if (key === null || key == undefined) {
      key = globalThis.distribution.util.id.getID(state);
    }

    getNode(key, (e, node) => {
      if (e) {
        return callback(e, null);
      }
      const remote = {node: node, service: `store`, method: `put`};
      const localConfig = {key: key, gid: context.gid};
      globalThis.distribution.local.comm.send([state, localConfig], remote, callback);
    });
  }

  /**
   * @param {any} state
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function append(state, configuration, callback) {
    return callback(new Error('store.append not implemented')); // You'll need to implement this method for the distributed processing milestone.
  }

  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function del(configuration, callback) {
    const key = typeof configuration === 'string' ? configuration : configuration?.key;
    if (key === null || key == undefined) {
      return callback(new Error(`Delete key cannot be null`), null);
    }

    getNode(key, (e, node) => {
      if (e) {
        return callback(e, null);
      }

      const remote = {node: node, service: `store`, method: `del`};
      const localConfig = {key: key, gid: context.gid};
      globalThis.distribution.local.comm.send([localConfig], remote, callback);
    });
  }

  /**
   * @param {Object.<string, Node>} configuration
   * @param {Callback} callback
   */
  function reconf(configuration, callback) {
    return callback(new Error('store.reconf not implemented'));
  }

  /* For the distributed store service, the configuration will
          always be a string */
  return {get, put, append, del, reconf};
}

module.exports = store;
