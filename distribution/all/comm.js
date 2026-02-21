// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 */

/**
 * NOTE: This Target is slightly different from local.all.Target
 * @typedef {Object} Target
 * @property {string} service
 * @property {string} method
 * @property {string} [gid]
 *
 * @typedef {Object} Comm
 * @property {(message: any[], configuration: Target, callback: Callback) => void} send
 */

/**
 * @param {Config} config
 * @returns {Comm}
 */
function comm(config) {
  const context = {};
  context.gid = config.gid || 'all';

  /**
   * @param {any[]} message
   * @param {Target} configuration
   * @param {Callback} callback
   */
  function send(message, configuration, callback) {
    globalThis.distribution.local.groups.get(context.gid, (err, nodes) => {
      if (err) {
        return callback(err, null);
      }

      const nodeIds = Object.keys(nodes);
      if (nodeIds.length == 0) {
        return callback(null, {});
      }

      const results = {}
      /** @type {Object.<string, Error>} */
      const errors = {}
      let received = 0;
      for (const nodeId of nodeIds) {
        const node = nodes[nodeId];

        const remote = {
          node: node,
          service: configuration.service,
          method: configuration.method, 
          gid: configuration.gid || 'local'
        };

        globalThis.distribution.local.comm.send(message, remote, (err, response) => {
          received += 1;
          if (err) {
            errors[nodeId] = err;
          } else {
            results[nodeId] = response;
          }

          if (received === nodeIds.length) {
            if (Object.keys(errors).length > 0) {
              callback(errors, results)
            } else {
              callback({}, results);
            }
          }

        });
      }
    });
  }
  return {send};
}

module.exports = comm;
