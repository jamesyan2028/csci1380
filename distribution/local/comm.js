// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Node} Node
 */

const http = require('node:http');

/**
 * @typedef {Object} Target
 * @property {string} service
 * @property {string} method
 * @property {Node} node
 * @property {string} [gid]
 */

/**
 * @param {Array<any>} message
 * @param {Target} remote
 * @param {(error: Error, value?: any) => void} callback
 * @returns {void}
 */
function send(message, remote, callback) {
  const serialized = globalThis.distribution.util.serialize(message);

  const options = {
    hostname: remote.node.ip,
    port: remote.node.port,
    path: `/${remote.service}/${remote.method}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(serialized),
    },
  };
  
  const req = http.request(options, (res) => {
    let incomingData = '';
    res.on('data', (packet) => {
      incomingData += packet;
    });

    res.on('end', () => {
      const [error, value] = globalThis.distribution.util.deserialize(incomingData);
      callback(error, value)
    });

  });

  req.on('error', (err) => {
      callback(err);
  });

  req.write(serialized);
  req.end();
}

module.exports = {send};