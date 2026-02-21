// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../util/id.js").Node} Node
 *
 * @typedef {Object} Groups
 * @property {(config: Config | string, group: Object.<string, Node>, callback: Callback) => void} put
 * @property {(name: string, callback: Callback) => void} del
 * @property {(name: string, callback: Callback) => void} get
 * @property {(name: string, node: Node, callback: Callback) => void} add
 * @property {(name: string, node: string, callback: Callback) => void} rem
 */

/**
 * @param {Config} config
 * @returns {Groups}
 */
function groups(config) {
  const context = {gid: config.gid || 'all'};

  function broadcastHelper(method, args, callback) {
    const remote = {
      service: 'groups',
      method: method
    }
    const groupService = globalThis.distribution[context.gid];
    if (!groupService) {
      return callback(new Error(`Group not found: ${context.gid}`), null);
    }
    groupService.comm.send(args, remote, callback);
  }

  /**
   * @param {Config | string} config
   * @param {Object.<string, Node>} group
   * @param {Callback} callback
   */
  function put(config, group, callback) {
    broadcastHelper('put', [config, group], callback);
  }

  /**
   * @param {string} name
   * @param {Callback} callback
   */
  function del(name, callback) {
    broadcastHelper('del', [name], callback);
  }

  /**
   * @param {string} name
   * @param {Callback} callback
   */
  function get(name, callback) {
    broadcastHelper('get', [name], callback);
  }

  /**
   * @param {string} name
   * @param {Node} node
   * @param {Callback} callback
   */
  function add(name, node, callback) {
    broadcastHelper('add', [name, node], callback);
  }

  /**
   * @param {string} name
   * @param {string} node
   * @param {Callback} callback
   */
  function rem(name, node, callback) {
    broadcastHelper('rem', [name, node], callback);
  }

  return {
    put, del, get, add, rem,
  };
}

module.exports = groups;
