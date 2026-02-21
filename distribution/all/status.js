// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../util/id.js").Node} Node
 *
 * @typedef {Object} Status
 * @property {(configuration: string, callback: Callback) => void} get
 * @property {(configuration: Node, callback: Callback) => void} spawn
 * @property {(callback: Callback) => void} stop
 */

/**
 * @param {Config} config
 * @returns {Status}
 */
function status(config) {
  const context = {};
  context.gid = config.gid || 'all';

  /**
   * @param {string} configuration
   * @param {Callback} callback
   */
  function get(configuration, callback) {
    const remote = {
      service: 'status',
      method: 'get',
    };
    globalThis.distribution[context.gid].comm.send([configuration], remote, (err, results) => {
      if (err) {
        return callback(err, null);
      }

      const aggregate = {
        count: 0,
        heapTotal: 0,
        heapUsed: 0
      };

      for (const nodeId in results) {
        const nodeStatus = results[nodeId];
        if (nodeStatus) {
          aggregate.count += 1;
          aggregate.heapTotal += nodeStatus.heapTotal;
          aggregate.heapUsed += nodeStatus.heapUsed;
        }
      }

      callback(null, aggregate);
    });
  }

  /**
   * @param {Node} configuration
   * @param {Callback} callback
   */
  function spawn(configuration, callback) {
    globalThis.distribution.local.status.spawn(configuration, (err, node) => {
      if (err) {
        return callback(err, null);
      }

      globalThis.distribution[context.gid].groups.put(context.gid, node, (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, node);
      });
    });
  }

  /**
   * @param {Callback} callback
   */
  function stop(callback) {
    const remote = {
      service: 'status',
      method: 'stop',
    }
    globalThis.distribution.all.comm.send([], remote, (err, val) => {
      callback(err, val);
    })
  }

  return {get, stop, spawn};
}

module.exports = status;
