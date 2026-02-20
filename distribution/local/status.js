// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Node} Node
 */

const { id } = require("../util/util.js");

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function get(configuration, callback) {
  const config = global.distribution.node.config;
  const memory = process.memoryUsage();

  const nodeInfo = {
    ip: config.ip,
    port: config.port,
  }



  const status = {
    'nid': id.getNID(nodeInfo),
    'sid': id.getSID(nodeInfo),
    'ip': config.ip,
    'port': config.port,
    'counts': global.totalMessageCount || 0,
    'heapTotal': memory.heapTotal,
    'heapUsed': memory.heapUsed,
  }

  if (configuration in status) {
    callback(null, status[configuration]);
  } else {
    callback(new Error(`Key "${configuration}" not found`), null);
  }
};


/**
 * @param {Node} configuration
 * @param {Callback} callback
 */
function spawn(configuration, callback) {
  callback(new Error('status.spawn not implemented'));
}

/**
 * @param {Callback} callback
 */
function stop(callback) {
  callback(new Error('status.stop not implemented'));
}

module.exports = {get, spawn, stop};