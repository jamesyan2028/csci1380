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
      globalThis.distribution.local.groups.get(context.gid, (e, group) => {
        if (e) return callback(e, null);

        const nodes = Object.values(group);
        if (nodes.length === 0) return callback(null, []);

        let received = 0;
        const allKeys = [];
        const errors = [];

        nodes.forEach((node) => {
          const remote = {node, service: 'store', method: 'get', gid: 'local'};
          const localConfig = {key: null, gid: context.gid};
          globalThis.distribution.local.comm.send([localConfig], remote, (e, keys) => {
            if (e) errors.push(e);
            else if (Array.isArray(keys)) allKeys.push(...keys);

            received += 1;
            if (received === nodes.length) {
              callback(errors.length > 0 ? errors[0] : null, allKeys);
            }
          });
        });
      });
      return;
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
    let key = typeof configuration === 'string' ? configuration : configuration?.key;
    if (key === null || key == undefined) {
      return callback(new Error('Cannot append with null key'), null);
    }

    getNode(key, (e, node) => {
      if (e) return callback(e, null);

      const remote = {node: node, service: 'store', method: 'append'};
      const localConfig = {key: key, gid: context.gid};
      globalThis.distribution.local.comm.send([state, localConfig], remote, callback);
    });
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
